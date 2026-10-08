const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    email: String,
    passwordHash: String,
    role: String,
    driverId: String,
    busNumber: String,
    currentLocation: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
        timestamp: { type: Date }
    }
}, {
    collection: 'users',
    timestamps: true
});

const User = mongoose.model('User', userSchema);

mongoose.connect('mongodb://localhost:27017/RouteFinderDB')
    .then(async () => {
        console.log('Connected to MongoDB');
        
        // Find all drivers with bus number 279
        const drivers = await User.find({ role: 'driver', busNumber: '279' });
        console.log('Drivers with bus 279:', drivers);
        
        // Find all users
        const users = await User.find({});
        console.log('All users:', users);
        
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });