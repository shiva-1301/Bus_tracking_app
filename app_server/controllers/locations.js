const Location = require('../models/locations');
const User = require('../models/users');
const { cleanString, isValidLatitude, isValidLongitude } = require('../utils/validation');

// Start tracking a trip
const startTracking = async (req, res) => {
    try {
        const busNumber = cleanString(req.body.busNumber);
        const driverId = cleanString(req.body.driverId);
        const startLocation = cleanString(req.body.startLocation);
        const endLocation = cleanString(req.body.endLocation);
        const { latitude, longitude } = req.body;
        const userId = req.user._id; // Extracted from JWT token in middleware

        // Validate required fields (0 is a valid coordinate, so check types rather than truthiness)
        if (!busNumber || !driverId || !startLocation || !endLocation) {
            return res.status(400).json({ error: 'Bus number, driver ID, start and end location are required' });
        }
        if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
            return res.status(400).json({ error: 'Valid numeric latitude and longitude are required' });
        }
        
        // Verify that the user is a driver and matches the driverId
        const user = await User.findById(userId);
        if (!user || user.role !== 'driver' || user.driverId !== driverId) {
            return res.status(403).json({ error: 'Access denied. Invalid driver.' });
        }
        
        // End any trip this driver left running so they never appear twice as "live"
        await Location.updateMany({ userId, isActive: true }, { $set: { isActive: false } });

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
        
        // Update user's bus number and current location
        const updatedUser = await User.findByIdAndUpdate(userId, {
            $set: {
                'busNumber': busNumber,
                'currentLocation.lat': latitude,
                'currentLocation.lng': longitude,
                'currentLocation.timestamp': new Date()
            }
        }, { new: true });
        
        
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
        const driverId = cleanString(req.body.driverId);
        const { latitude, longitude } = req.body;
        const userId = req.user._id; // Extracted from JWT token in middleware

        // Validate required fields (0 is a valid coordinate, so check types rather than truthiness)
        if (!driverId || !isValidLatitude(latitude) || !isValidLongitude(longitude)) {
            return res.status(400).json({ error: 'Driver ID and valid numeric latitude/longitude are required' });
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
        
        
        // Validate required fields
        if (!driverId) {
            return res.status(400).json({ error: 'Driver ID is required' });
        }
        
        // Verify that the user is a driver and matches the driverId
        const user = await User.findById(userId);
        if (!user || user.role !== 'driver' || user.driverId !== driverId) {
            return res.status(403).json({ error: 'Access denied. Invalid driver.' });
        }
        
        // Find the latest active location record for this driver
        const location = await Location.findOne({ userId, isActive: true }).sort({ createdAt: -1 });
        
        if (!location) {
            // Let's also check if there are any inactive trips for this driver
            const inactiveLocations = await Location.find({ userId, isActive: false }).sort({ createdAt: -1 }).limit(5);
            
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
        res.status(500).json({ error: 'Failed to end trip tracking' });
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
        
        
        // Populate user details for each location
        const populatedLocations = await Location.populate(locations, { path: 'userId', select: 'email driverId' });
        
        
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
        res.status(500).json({ error: 'Failed to check trip status' });
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