const axios = require('axios');

async function testCoordinateUpdates() {
    try {
        // Register a new driver
        console.log('Registering a new driver...');
        const registerResponse = await axios.post('http://localhost:3000/api/register', {
            email: 'testdriver2@example.com',
            password: 'testpassword',
            role: 'driver',
            driverId: 'TEST002'
        });
        console.log('Registration successful:', registerResponse.data);
        
        // Login to get token
        console.log('Logging in...');
        const loginResponse = await axios.post('http://localhost:3000/api/login', {
            email: 'testdriver2@example.com',
            password: 'testpassword'
        });
        const token = loginResponse.data.token;
        console.log('Login successful, token received');
        
        // Start a trip
        console.log('Starting a trip...');
        const startTripResponse = await axios.post('http://localhost:3000/api/locations/start', {
            busNumber: '456',
            driverId: 'TEST002',
            startLocation: 'Start Point',
            endLocation: 'End Point',
            latitude: 12.9716,
            longitude: 77.5946
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Trip started successfully:', startTripResponse.data);
        
        // Update coordinates
        console.log('Updating coordinates...');
        const updateCoordResponse = await axios.put('http://localhost:3000/api/coordinates', {
            driverId: 'TEST002',
            latitude: 12.9720,
            longitude: 77.5950
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Coordinates updated successfully:', updateCoordResponse.data);
        
        // Check coordinates
        console.log('Checking coordinates...');
        const getCoordResponse = await axios.get('http://localhost:3000/api/coordinates');
        console.log('Current coordinates:', getCoordResponse.data);
        
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testCoordinateUpdates();