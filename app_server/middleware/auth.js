const jwt = require('jsonwebtoken');
const User = require('../models/users');

const { jwtSecret: JWT_SECRET } = require('../config');

const authenticateUser = async (req, res, next) => {
    try {
        // Get the token from the Authorization header
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }
        
        // Extract the token
        const token = authHeader.replace('Bearer ', '');
        
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Find the user
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ error: 'Access denied. Invalid token.' });
        }
        
        // Attach the user to the request object
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Access denied. Invalid token.' });
    }
};

module.exports = { authenticateUser };