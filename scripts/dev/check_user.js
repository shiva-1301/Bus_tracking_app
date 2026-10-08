const axios = require('axios');

async function checkUserStatus() {
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
        
        // If the user is a driver, try to start a trip
        if (role === 'driver') {
            console.log('User is a driver. Attempting to start a trip...');
            try {
                const startTripResponse = await axios.post('http://localhost:3000/api/locations/start', {
                    busNumber: '279',
                    driverId: 'abc@gmail.com', // This should be the actual driverId
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
            } catch (tripError) {
                console.error('Error starting trip:', tripError.response ? tripError.response.data : tripError.message);
            }
        } else {
            console.log('User is a regular user, not a driver.');
        }
        
        // Check current coordinates
        console.log('Checking current coordinates...');
        const coordResponse = await axios.get('http://localhost:3000/api/coordinates');
        console.log('Current coordinates:', coordResponse.data);
        
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

checkUserStatus();