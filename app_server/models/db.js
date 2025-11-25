const mongoose = require('mongoose');

// Replace with your actual MongoDB connection string
const dbURI = 'mongodb://localhost:27017/RouteFinderDB'; 

mongoose.connect(dbURI)
    .then(() => console.log('Mongoose connection open to ' + dbURI))
    .catch(err => console.error('Mongoose connection error:', err));

// Bring in your user model (ensure this runs after connection)
require('./users'); 
