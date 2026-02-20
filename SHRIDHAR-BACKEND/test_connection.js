const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGO_URI;

if (!uri) {
    console.error('MONGO_URI is not defined in the .env file');
    process.exit(1);
}

console.log('Attempting to connect to MongoDB...');
// Hide password in logs for security
const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
console.log('URI:', maskedUri);

mongoose.connect(uri)
    .then(() => {
        console.log('✅ Successfully connected to MongoDB!');
        console.log('Host:', mongoose.connection.host);
        console.log('Database:', mongoose.connection.name);
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection failed!');
        console.error('Error Details:', err.message);
        process.exit(1);
    });
