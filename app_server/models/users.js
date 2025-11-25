const mongoose = require('mongoose');

// --- 1. Define the Schema ---
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true, // Ensures no two accounts can share the same email
        required: true,
        lowercase: true, // Always store emails in lowercase
        trim: true
    },
    // We store the hashed version of the password for security
    passwordHash: {
        type: String,
        required: true
    },
    
    // CRITICAL FIELD: Determines the user's access and redirect path
    role: {
        type: String,
        enum: ['user', 'driver'], // Restricts values to only these two options
        required: true,
        default: 'user' // Default role for accounts registered via the website
    },

    // --- Driver-specific fields ---
    
    // Driver ID for authentication
    driverId: {
        type: String,
        // Custom validator: makes driverId required ONLY if the role is 'driver'
        required: [function() { return this.role === 'driver'; }, 'Driver ID is required for drivers.'],
        index: true // Index this for faster searching
    },
    
    // The bus number the driver operates (optional during registration)
    busNumber: {
        type: String,
        required: false, // Not required during registration
        index: true // Index this for faster searching by bus number
    },
    
    // Stores the driver's last reported location
    currentLocation: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
        timestamp: { type: Date }
    }
}, {
    // Schema options
    collection: 'users', // Name the collection explicitly
    timestamps: true     // Adds createdAt and updatedAt fields automatically
});

// --- 2. Create and Export the Model ---
// The name 'User' will be used in the Controller (mongoose.model('User'))
module.exports = mongoose.model('User', userSchema);
