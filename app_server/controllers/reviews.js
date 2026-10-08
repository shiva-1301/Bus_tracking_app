const Review = require('../models/reviews');
const { cleanString } = require('../utils/validation');

const MAX_COMMENT_LENGTH = 500;
const MAX_NAME_LENGTH = 50;

// Get all reviews
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 }); // Sort by newest first
        res.status(200).json(reviews);
    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

// Add a new review
const addReview = async (req, res) => {
    try {
        const username = cleanString(req.body.username);
        const busNumber = cleanString(req.body.busNumber);
        const comment = cleanString(req.body.comment);
        const rating = Number(req.body.rating);

        // Validate required fields
        if (!username || !rating || !comment) {
            return res.status(400).json({ error: 'Username, rating, and comment are required' });
        }
        if (username.length > MAX_NAME_LENGTH || comment.length > MAX_COMMENT_LENGTH) {
            return res.status(400).json({ error: `Name must be at most ${MAX_NAME_LENGTH} and comment at most ${MAX_COMMENT_LENGTH} characters` });
        }

        // Validate rating range (whole stars only)
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be a whole number between 1 and 5' });
        }
        
        // Create new review
        const newReview = new Review({
            userId: req.user ? req.user._id : null, // If authenticated, associate with user
            username,
            busNumber: busNumber || undefined,
            rating,
            comment
        });
        
        // Save to database
        const savedReview = await newReview.save();
        
        // Return the saved review
        res.status(201).json(savedReview);
    } catch (err) {
        console.error('Error adding review:', err);
        res.status(500).json({ error: 'Failed to add review' });
    }
};

// Get reviews for a specific bus
const getReviewsByBus = async (req, res) => {
    try {
        const { busNumber } = req.params;
        
        if (!busNumber) {
            return res.status(400).json({ error: 'Bus number is required' });
        }
        
        const reviews = await Review.find({ busNumber: busNumber }).sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (err) {
        console.error('Error fetching reviews by bus:', err);
        res.status(500).json({ error: 'Failed to fetch reviews for this bus' });
    }
};

module.exports = {
    getAllReviews,
    addReview,
    getReviewsByBus
};