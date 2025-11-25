const Coordinate = require('../models/coordinates');
const User = require('../models/users');

// Update or create driver coordinates
const updateCoordinates = async (req, res) => {
    try {
        const { driverId, latitude, longitude } = req.body;
        const userId = req.user ? req.user._id : null; // Extracted from JWT token in middleware
        
        // Validate required fields
        if (!driverId || !latitude || !longitude) {
            return res.status(400).json({ error: 'Driver ID, latitude, and longitude are required' });
        }
        
        // For testing purposes, bypass authentication and find user by email or driverId
        let user;
        if (userId) {
            // Verify that the user is a driver and matches the driverId
            user = await User.findById(userId);
            if (!user || user.role !== 'driver' || user.driverId !== driverId) {
                return res.status(403).json({ error: 'Access denied. Invalid driver.' });
            }
        } else {
            // For testing, find user by email or driverId
            user = await User.findOne({ $or: [{ email: driverId }, { driverId: driverId }], role: 'driver' });
            if (!user) {
                return res.status(403).json({ error: 'Access denied. Invalid driver.' });
            }
        }
        
        // Delete any existing coordinate records for this driver
        await Coordinate.deleteMany({ driverId });
        
        // Create new coordinate record
        const coordinate = new Coordinate({
            driverId,
            userId: user._id,
            latitude,
            longitude
        });
        
        // Save to database
        const savedCoordinate = await coordinate.save();
        
        // Also update user's bus number and current location for immediate access
        await User.findByIdAndUpdate(user._id, {
            $set: {
                'busNumber': user.busNumber, // Keep existing bus number
                'currentLocation.lat': latitude,
                'currentLocation.lng': longitude,
                'currentLocation.timestamp': new Date()
            }
        });
        
        // Return the saved coordinate
        res.status(200).json(savedCoordinate);
    } catch (err) {
        console.error('Error updating coordinates:', err);
        res.status(500).json({ error: 'Failed to update coordinates' });
    }
};

// Delete all coordinates for a specific driver
const deleteCoordinatesByDriverId = async (req, res) => {
    try {
        const { driverId } = req.body;
        const userId = req.user ? req.user._id : null; // Extracted from JWT token in middleware
        
        console.log('Delete coordinates request:', { driverId, userId });
        
        // Validate required fields
        if (!driverId) {
            return res.status(400).json({ error: 'Driver ID is required' });
        }
        
        // For testing purposes, bypass authentication and find user by email or driverId
        let user;
        if (userId) {
            // Verify that the user is a driver and matches the driverId
            user = await User.findById(userId);
            console.log('Found user by ID:', user);
            if (!user || user.role !== 'driver' || user.driverId !== driverId) {
                return res.status(403).json({ error: 'Access denied. Invalid driver.' });
            }
        } else {
            // For testing, find user by email or driverId
            user = await User.findOne({ $or: [{ email: driverId }, { driverId: driverId }], role: 'driver' });
            console.log('Found user by email/driverId:', user);
            if (!user) {
                return res.status(403).json({ error: 'Access denied. Invalid driver.' });
            }
        }
        
        // Delete all coordinate records for this driver
        const result = await Coordinate.deleteMany({ driverId });
        console.log('Delete result:', result);
        
        // Also reset user's current location
        await User.findByIdAndUpdate(user._id, {
            $set: {
                'currentLocation.lat': 0,
                'currentLocation.lng': 0,
                'currentLocation.timestamp': new Date()
            }
        });
        
        // Return success message with number of deleted records
        res.status(200).json({ 
            message: `Successfully deleted ${result.deletedCount} coordinate records for driver ${driverId}` 
        });
    } catch (err) {
        console.error('Error deleting coordinates:', err);
        res.status(500).json({ error: 'Failed to delete coordinates', details: err.message });
    }
};

// Get coordinates for a specific driver
const getCoordinatesByDriverId = async (req, res) => {
    try {
        const { driverId } = req.params;
        
        if (!driverId) {
            return res.status(400).json({ error: 'Driver ID is required' });
        }
        
        // Find the latest coordinate record for this driver
        const coordinate = await Coordinate.findOne({ driverId }).sort({ timestamp: -1 });
        
        if (!coordinate) {
            return res.status(404).json({ error: 'No coordinates found for this driver' });
        }
        
        res.status(200).json(coordinate);
    } catch (err) {
        console.error('Error fetching coordinates by driver ID:', err);
        res.status(500).json({ error: 'Failed to fetch coordinates' });
    }
};

// Get coordinates for all drivers
const getAllCoordinates = async (req, res) => {
    try {
        // Find the latest coordinate record for each driver
        const coordinates = await Coordinate.aggregate([
            { $sort: { timestamp: -1 } },
            { $group: { _id: "$driverId", doc: { $first: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$doc" } }
        ]);
        
        res.status(200).json(coordinates);
    } catch (err) {
        console.error('Error fetching all coordinates:', err);
        res.status(500).json({ error: 'Failed to fetch coordinates' });
    }
};

// Get coordinates for drivers of a specific bus number
const getCoordinatesByBusNumber = async (req, res) => {
    try {
        const { busNumber } = req.params;
        
        if (!busNumber) {
            return res.status(400).json({ error: 'Bus number is required' });
        }
        
        // First find all drivers for this bus number
        const drivers = await User.find({ role: 'driver', busNumber: busNumber }, { driverId: 1 });
        const driverIds = drivers.map(driver => driver.driverId);
        
        if (driverIds.length === 0) {
            return res.status(404).json({ message: `No drivers found for bus ${busNumber}.` });
        }
        
        // Find the latest coordinate records for these drivers
        const coordinates = await Coordinate.aggregate([
            { $match: { driverId: { $in: driverIds } } },
            { $sort: { timestamp: -1 } },
            { $group: { _id: "$driverId", doc: { $first: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$doc" } }
        ]);
        
        res.status(200).json(coordinates);
    } catch (err) {
        console.error('Error fetching coordinates by bus number:', err);
        res.status(500).json({ error: 'Failed to fetch coordinates' });
    }
};

module.exports = {
    updateCoordinates,
    deleteCoordinatesByDriverId,
    getCoordinatesByDriverId,
    getAllCoordinates,
    getCoordinatesByBusNumber
};