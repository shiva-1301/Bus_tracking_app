const axios = require('axios');

async function startTripForAbc() {
    try {
        // Login as abc@gmail.com
        console.log('Logging in as abc@gmail.com...');
        const loginResponse = await axios.post('http://localhost:3000/api/login', {
            email: 'abc@gmail.com',
            password: '123'
        });
        
        const token = loginResponse.data.token;
        const role = loginResponse.data.role;
        
        console.log('Login successful!');
        console.log('Role:', role);
        console.log('Token:', token.substring(0, 50) + '...');
        
        // Start a trip with the correct driverId
        console.log('Starting trip with correct driverId...');
        const startTripResponse = await axios.post('http://localhost:3000/api/locations/start', {
            busNumber: '279',
            driverId: '1', // This is the correct driverId
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
            driverId: '1', // This is the correct driverId
            latitude: 12.9720,
            longitude: 77.5950
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Coordinates updated successfully:', updateCoordResponse.data);
        
        // Check current coordinates
        console.log('Checking current coordinates...');
        const coordResponse = await axios.get('http://localhost:3000/api/coordinates');
        console.log('Current coordinates:', coordResponse.data);
        
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

startTripForAbc();