const mongoose = require('mongoose');

// Define the location schema
const locationSchema = new mongoose.Schema({
    busNumber: {
        type: String,
        required: true,
        index: true
    },
    driverId: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    startLocation: {
        type: String,
        required: true
    },
    endLocation: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    collection: 'locations',
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Create and export the Location model
module.exports = mongoose.model('Location', locationSchema);