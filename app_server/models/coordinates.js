const mongoose = require('mongoose');

// Define the coordinate schema
const coordinateSchema = new mongoose.Schema({
    driverId: {
        type: String,
        required: true,
        index: true
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
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'coordinates',
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Create and export the Coordinate model
module.exports = mongoose.model('Coordinate', coordinateSchema);