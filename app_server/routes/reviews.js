const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviews');

// GET /api/reviews - Get all reviews
router.get('/', reviewController.getAllReviews);

// POST /api/reviews - Add a new review
router.post('/', reviewController.addReview);

// GET /api/reviews/bus/:busNumber - Get reviews for a specific bus
router.get('/bus/:busNumber', reviewController.getReviewsByBus);

module.exports = router;