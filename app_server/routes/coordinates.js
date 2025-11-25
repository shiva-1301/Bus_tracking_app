const express = require('express');
const router = express.Router();
const coordinateController = require('../controllers/coordinates');
const { authenticateUser } = require('../middleware/auth');

// PUT /api/coordinates - Update or create driver coordinates
router.put('/', authenticateUser, coordinateController.updateCoordinates);

// POST /api/coordinates/delete - Delete all coordinates for a driver
router.post('/delete', authenticateUser, coordinateController.deleteCoordinatesByDriverId);

// GET /api/coordinates/driver/:driverId - Get coordinates for a specific driver
router.get('/driver/:driverId', coordinateController.getCoordinatesByDriverId);

// GET /api/coordinates - Get coordinates for all drivers
router.get('/', coordinateController.getAllCoordinates);

// GET /api/coordinates/bus/:busNumber - Get coordinates for drivers of a specific bus number
router.get('/bus/:busNumber', coordinateController.getCoordinatesByBusNumber);

module.exports = router;