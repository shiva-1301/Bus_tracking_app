const mongoose = require('mongoose');
const User = mongoose.model('User'); // Import the User model defined in app_server/models/users.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// WARNING: In a real production application, ALWAYS load this from an environment variable!
const JWT_SECRET = 'YOUR_SUPER_SECRET_KEY_NEVER_SHARE_IT_CHANGE_ME'; 

// --- Helper Functions ---

/**
 * Creates a JWT for the authenticated user/driver.
 * The payload includes the user ID, email, and CRITICAL: the user's role.
 */
const generateJwt = (user) => {
    return jwt.sign(
        { _id: user._id, email: user.email, role: user.role }, 
        JWT_SECRET, 
        { expiresIn: '7d' } 
    );
};

// --- Controller Functions ---

/**
 * Handles self-registration for both 'user' and 'driver' role accounts.
 * Path: POST /api/register
 */
const register = async (req, res) => {
    // 1. Validate input
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({"message": "Email and password are required."});
    }

    try {
        // 2. Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(req.body.password, salt);

        // 3. Prepare user data based on role
        const userData = {
            email: req.body.email,
            passwordHash: passwordHash,
            role: req.body.role || 'user' // Default to 'user' if not specified
        };
        
        // Add driver-specific fields if registering as a driver
        if (req.body.role === 'driver') {
            if (!req.body.driverId) {
                return res.status(400).json({"message": "Driver ID is required for driver registration."});
            }
            userData.driverId = req.body.driverId;
            // Bus number is optional during registration
            if (req.body.busNumber) {
                userData.busNumber = req.body.busNumber;
            }
        }
        
        // 4. Create the new User
        const newUser = await User.create(userData);
        
        // 5. Registration successful: generate JWT and send it back
        const token = generateJwt(newUser);
        return res.status(201).json({ 
            token,
            role: newUser.role,
            userId: newUser._id,
            driverId: newUser.driverId
        });

    } catch (err) {
        if (err.code === 11000) { // MongoDB duplicate key error (email already exists)
            return res.status(409).json({"message": "Email address is already registered."});
        }
        console.error(err);
        return res.status(500).json({"message": "Internal server error during registration."});
    }
};

/**
 * Handles login for both 'user' and 'driver' roles.
 * Path: POST /api/login
 */
const login = async (req, res) => {
    // 1. Validate input
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({"message": "Email and password are required."});
    }

    try {
        // 2. Find the user/driver by email
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(401).json({"message": "Invalid credentials."});
        }

        // 3. Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(req.body.password, user.passwordHash);

        if (isMatch) {
            // 4. Authentication successful: generate JWT (which includes the role for front-end redirection)
            const token = generateJwt(user);
            return res.status(200).json({ 
                message: "Login successful",
                token: token,
                role: user.role,
                userId: user._id,
                driverId: user.driverId
            });
        } else {
            return res.status(401).json({"message": "Invalid credentials."});
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({"message": "Internal server error during login."});
    }
};

/**
 * Endpoint for the regular user to find drivers by bus number.
 * Path: GET /api/search/bus/:busNumber
 */
const searchDrivers = async (req, res) => {
    const busNumber = req.params.busNumber;
    
    console.log('Searching for drivers with bus number:', busNumber);

    if (!busNumber) {
        return res.status(400).json({"message": "Bus number is required."});
    }

    try {
        // Find users who have the 'driver' role AND match the bus number
        const driversData = await User.find(
            { role: 'driver', busNumber: busNumber },
            { email: 1, busNumber: 1, currentLocation: 1, driverId: 1 } // Include driverId in the response
        );
        
        console.log('Found drivers:', driversData);

        if (driversData.length > 0) {
            return res.status(200).json(driversData);
        } else {
            return res.status(404).json({"message": `No active drivers found for bus ${busNumber}.`});
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({"message": "Error searching for drivers."});
    }
};

/**
 * Controller for drivers to update their location after logging in.
 * Path: PUT /api/driver/location (Requires driver authentication/token)
 */
const updateLocation = async (req, res) => {
    // This is a placeholder: in a real app, the driver's ID would be extracted from the JWT/token
    const { email, lat, lng } = req.body; 

    if (!email || !lat || !lng) {
        return res.status(400).json({"message": "Email, latitude, and longitude are required."});
    }

    try {
        // Find the driver by email AND ensure they have the 'driver' role
        const driver = await User.findOneAndUpdate(
            { email: email, role: 'driver' },
            { $set: { 
                'currentLocation.lat': lat, 
                'currentLocation.lng': lng, 
                'currentLocation.timestamp': new Date() 
            }},
            { new: true, select: 'email busNumber currentLocation' } // Return updated fields
        );

        if (!driver) {
            return res.status(403).json({"message": "Driver not found or access denied."});
        }

        return res.status(200).json({
            message: "Location updated successfully",
            location: driver.currentLocation
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({"message": "Error updating driver location."});
    }
};


module.exports = {
    register,
    login,
    searchDrivers,
    updateLocation
};