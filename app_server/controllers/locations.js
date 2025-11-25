const Location = require('../models/locations');
const User = require('../models/users');

// Start tracking a trip
const startTracking = async (req, res) => {
    try {
        const { busNumber, driverId, startLocation, endLocation, latitude, longitude } = req.body;
        const userId = req.user._id; // Extracted from JWT token in middleware
        
        console.log('Start tracking request:', { busNumber, driverId, userId, startLocation, endLocation });
        
        // Validate required fields
        if (!busNumber || !driverId || !startLocation || !endLocation || !latitude || !longitude) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        // Verify that the user is a driver and matches the driverId
        const user = await User.findById(userId);
        console.log('Found user:', user);
        if (!user || user.role !== 'driver' || user.driverId !== driverId) {
            return res.status(403).json({ error: 'Access denied. Invalid driver.' });
        }
        
        // Create new location record
        const newLocation = new Location({
            busNumber,
            driverId,
            userId,
            latitude,
            longitude,
            startLocation,
            endLocation,
            isActive: true
        });
        
        // Save to database
        const savedLocation = await newLocation.save();
        console.log('Saved location:', savedLocation);
        
        // Update user's bus number and current location
        const updatedUser = await User.findByIdAndUpdate(userId, {
            $set: {
                'busNumber': busNumber,
                'currentLocation.lat': latitude,
                'currentLocation.lng': longitude,
                'currentLocation.timestamp': new Date()
            }
        }, { new: true });
        
        console.log('Updated user:', updatedUser);
        
        // Return the saved location
        res.status(201).json(savedLocation);
    } catch (err) {
        console.error('Error starting trip tracking:', err);
        res.status(500).json({ error: 'Failed to start trip tracking' });
    }
};

// Update location during a trip
const updateLocation = async (req, res) => {
    try {
        const { driverId, latitude, longitude } = req.body;
        const userId = req.user._id; // Extracted from JWT token in middleware
        
        // Validate required fields
        if (!driverId || !latitude || !longitude) {
            return res.status(400).json({ error: 'Driver ID, latitude, and longitude are required' });
        }
        
        // Verify that the user is a driver and matches the driverId
        const user = await User.findById(userId);
        if (!user || user.role !== 'driver' || user.driverId !== driverId) {
            return res.status(403).json({ error: 'Access denied. Invalid driver.' });
        }
        
        // Find the latest active location record for this driver
        const location = await Location.findOne({ userId, isActive: true }).sort({ createdAt: -1 });
        
        if (!location) {
            return res.status(404).json({ error: 'No active trip found for this driver' });
        }
        
        // Update the location
        location.latitude = latitude;
        location.longitude = longitude;
        location.timestamp = new Date();
        
        // Save to database
        const updatedLocation = await location.save();
        
        // Update user's current location
        await User.findByIdAndUpdate(userId, {
            $set: {
                'currentLocation.lat': latitude,
                'currentLocation.lng': longitude,
                'currentLocation.timestamp': new Date()
            }
        });
        
        // Return the updated location
        res.status(200).json(updatedLocation);
    } catch (err) {
        console.error('Error updating location:', err);
        res.status(500).json({ error: 'Failed to update location' });
    }
};

// End tracking a trip
const endTracking = async (req, res) => {
    try {
        const { driverId } = req.body;
        const userId = req.user._id; // Extracted from JWT token in middleware
        
        console.log('End tracking request:', { driverId, userId });
        
        // Validate required fields
        if (!driverId) {
            return res.status(400).json({ error: 'Driver ID is required' });
        }
        
        // Verify that the user is a driver and matches the driverId
        const user = await User.findById(userId);
        console.log('Found user:', user);
        if (!user || user.role !== 'driver' || user.driverId !== driverId) {
            return res.status(403).json({ 
                error: 'Access denied. Invalid driver.', 
                details: `User role: ${user?.role}, Expected driverId: ${driverId}, User driverId: ${user?.driverId}` 
            });
        }
        
        // Find the latest active location record for this driver
        const location = await Location.findOne({ userId, isActive: true }).sort({ createdAt: -1 });
        console.log('Found location:', location);
        
        if (!location) {
            // Let's also check if there are any inactive trips for this driver
            const inactiveLocations = await Location.find({ userId, isActive: false }).sort({ createdAt: -1 }).limit(5);
            console.log('Inactive locations found:', inactiveLocations);
            
            return res.status(404).json({ 
                error: 'No active trip found for this driver',
                details: `Found ${inactiveLocations.length} inactive trips`,
                hasInactiveTrips: inactiveLocations.length > 0
            });
        }
        
        // Mark the trip as inactive
        location.isActive = false;
        location.timestamp = new Date();
        
        // Save to database
        const updatedLocation = await location.save();
        console.log('Updated location:', updatedLocation);
        
        // Update user's current location
        await User.findByIdAndUpdate(userId, {
            $set: {
                'currentLocation.lat': 0,
                'currentLocation.lng': 0,
                'currentLocation.timestamp': new Date()
            }
        });
        
        // Return the updated location
        res.status(200).json(updatedLocation);
    } catch (err) {
        console.error('Error ending trip tracking:', err);
        res.status(500).json({ error: 'Failed to end trip tracking', details: err.message });
    }
};

// Get all active locations for a specific bus number
const getLocationsByBusNumber = async (req, res) => {
    try {
        const { busNumber } = req.params;
        
        if (!busNumber) {
            return res.status(400).json({ error: 'Bus number is required' });
        }
        
        // Find all active locations for this bus number
        const locations = await Location.find({ busNumber, isActive: true }).sort({ timestamp: -1 });
        
        console.log('Found locations for bus', busNumber, ':', locations);
        
        // Populate user details for each location
        const populatedLocations = await Location.populate(locations, { path: 'userId', select: 'email driverId' });
        
        console.log('Populated locations for bus', busNumber, ':', populatedLocations);
        
        res.status(200).json(populatedLocations);
    } catch (err) {
        console.error('Error fetching locations by bus number:', err);
        res.status(500).json({ error: 'Failed to fetch locations' });
    }
};

// Get all active locations
const getAllActiveLocations = async (req, res) => {
    try {
        // Find all active locations
        const locations = await Location.find({ isActive: true }).sort({ timestamp: -1 });
        
        // Populate user details for each location
        const populatedLocations = await Location.populate(locations, { path: 'userId', select: 'email driverId' });
        
        res.status(200).json(populatedLocations);
    } catch (err) {
        console.error('Error fetching all active locations:', err);
        res.status(500).json({ error: 'Failed to fetch locations' });
    }
};

// Check if a driver has an active trip
const checkActiveTrip = async (req, res) => {
    try {
        const userId = req.user._id; // Extracted from JWT token in middleware
        
        // Find the latest active location record for this driver
        const location = await Location.findOne({ userId, isActive: true }).sort({ createdAt: -1 });
        
        if (location) {
            res.status(200).json({ 
                activeTrip: true, 
                location: location 
            });
        } else {
            res.status(200).json({ 
                activeTrip: false 
            });
        }
    } catch (err) {
        console.error('Error checking active trip:', err);
        res.status(500).json({ error: 'Failed to check trip status', details: err.message });
    }
};

module.exports = {
    startTracking,
    updateLocation,
    endTracking,
    checkActiveTrip,
    getLocationsByBusNumber,
    getAllActiveLocations
};