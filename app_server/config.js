// Central runtime configuration. Values come from environment variables
// (or a local .env file in development — see .env.example).
const path = require('path');
const fs = require('fs');

const envFile = path.join(__dirname, '..', '.env');
if (fs.existsSync(envFile) && typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(envFile);
}

const isProduction = process.env.NODE_ENV === 'production';

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    if (isProduction) {
        throw new Error('JWT_SECRET environment variable is required in production.');
    }
    jwtSecret = 'dev-only-insecure-secret-change-me';
    console.warn('[config] JWT_SECRET is not set — using an insecure development secret.');
}

module.exports = {
    isProduction,
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/RouteFinderDB',
    corsOrigin: process.env.CORS_ORIGIN || '*',
};
