const mongoose = require('mongoose');
const locationSchema = new mongoose.Schema({
    busNumber: String,
    driverId: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    latitude: Number,
    longitude: Number,
    startLocation: String,
    endLocation: String,
    timestamp: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
});

const Location = mongoose.model('Location', locationSchema);

mongoose.connect('mongodb://localhost:27017/RouteFinderDB')
    .then(async () => {
        console.log('Connected to MongoDB');
        
        // Find all locations
        const locations = await Location.find({}).limit(5);
        console.log('Sample locations:', locations);
        
        // Find active locations for bus 279
        const bus279Locations = await Location.find({ busNumber: '279', isActive: true });
        console.log('Active locations for bus 279:', bus279Locations);
        
        // Find all locations for driver with driverId '1'
        const driver1Locations = await Location.find({ driverId: '1' });
        console.log('All locations for driver 1:', driver1Locations);
        
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });