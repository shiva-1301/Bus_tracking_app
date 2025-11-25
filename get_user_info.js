// We need to access the database directly to get user information
// since there's no API endpoint to get user details by email

const mongoose = require('mongoose');

// MongoDB connection string (same as in your db.js)
const dbURI = 'mongodb://localhost:27017/RouteFinderDB';

// User schema (same as in your models/users.js)
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'driver'],
        required: true,
        default: 'user'
    },
    driverId: {
        type: String,
        required: [function() { return this.role === 'driver'; }, 'Driver ID is required for drivers.'],
        index: true
    },
    busNumber: {
        type: String,
        required: false,
        index: true
    },
    currentLocation: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
        timestamp: { type: Date }
    }
}, {
    collection: 'users',
    timestamps: true
});

async function getUserInfo() {
    try {
        // Connect to MongoDB
        await mongoose.connect(dbURI);
        console.log('Connected to MongoDB');
        
        // Create the User model
        const User = mongoose.model('User', userSchema);
        
        // Find the user with email abc@gmail.com
        const user = await User.findOne({ email: 'abc@gmail.com' });
        
        if (user) {
            console.log('User found:');
            console.log('Email:', user.email);
            console.log('Role:', user.role);
            console.log('Driver ID:', user.driverId);
            console.log('Bus Number:', user.busNumber);
            console.log('Current Location:', user.currentLocation);
        } else {
            console.log('User not found');
        }
        
        // Close the connection
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
    }
}

getUserInfo();