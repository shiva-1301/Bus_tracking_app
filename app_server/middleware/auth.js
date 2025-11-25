const jwt = require('jsonwebtoken');
const User = require('../models/users');

// WARNING: In a real production application, ALWAYS load this from an environment variable!
const JWT_SECRET = 'YOUR_SUPER_SECRET_KEY_NEVER_SHARE_IT_CHANGE_ME';

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
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Access denied. Invalid token.' });
    }
};

module.exports = { authenticateUser };