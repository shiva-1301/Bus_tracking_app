const express = require('express');
const router = express.Router();
// Import your controller functions
const userController = require('../controllers/users');
const { authenticateUser } = require('../middleware/auth');

// --- Authentication Routes ---

// Route for self-registration (Role: 'user' default)
// Angular will POST to /api/register
router.post('/register', userController.register);

// Route for login (Handles both 'user' and 'driver' roles)
// Angular will POST to /api/login
router.post('/login', userController.login);

// --- User Functionality Routes ---

// Route for general users to search for drivers by bus number
// Angular will GET to /api/search/bus/:busNumber
router.get('/search/bus/:busNumber', userController.searchDrivers);

// --- Driver Functionality Routes ---

// Route for drivers to update their location (requires driver to be logged in and authenticated)
// Angular (Driver Dashboard) will PUT to /api/driver/location
router.put('/driver/location', authenticateUser, userController.updateLocation);


module.exports = router;
