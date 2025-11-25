const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locations');
const { authenticateUser } = require('../middleware/auth');

// POST /api/locations/start - Start tracking a trip
router.post('/start', authenticateUser, locationController.startTracking);

// PUT /api/locations/update - Update location during a trip
router.put('/update', authenticateUser, locationController.updateLocation);

// POST /api/locations/end - End tracking a trip
router.post('/end', authenticateUser, locationController.endTracking);

// GET /api/locations/check - Check if driver has an active trip
router.get('/check', authenticateUser, locationController.checkActiveTrip);

// GET /api/locations/bus/:busNumber - Get all active locations for a specific bus number
router.get('/bus/:busNumber', locationController.getLocationsByBusNumber);

// GET /api/locations - Get all active locations
router.get('/', locationController.getAllActiveLocations);

module.exports = router;