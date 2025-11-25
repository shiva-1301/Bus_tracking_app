const mongoose = require('mongoose');

// Define the review schema
const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Not required as anonymous reviews are allowed
    },
    username: {
        type: String,
        required: true
    },
    busNumber: {
        type: String,
        required: false
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    }
}, {
    collection: 'reviews',
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Create and export the Review model
module.exports = mongoose.model('Review', reviewSchema);