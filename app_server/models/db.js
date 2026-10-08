const mongoose = require('mongoose');
const { mongoUri } = require('../config');

// Hide credentials when logging the connection string
const safeUri = mongoUri.replace(/\/\/([^@]+)@/, '//***@');

mongoose.connect(mongoUri)
    .then(() => console.log('Mongoose connection open to ' + safeUri))
    .catch(err => console.error('Mongoose connection error:', err.message));

// Bring in your user model (ensure this runs after connection)
require('./users');
