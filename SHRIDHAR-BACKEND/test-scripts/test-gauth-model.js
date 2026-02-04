const mongoose = require('mongoose');
const User = require('../src/models/User');
const dotenv = require('dotenv');

dotenv.config();

async function runTest() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB Connected');

        const testEmail = `gauth_test_${Date.now()}@example.com`;

        // 1. Try create User with googleId and NO password
        console.log('Test 1: Create User with googleId (No Password)...');
        const user = await User.create({
            name: 'GAuth User',
            email: testEmail,
            googleId: '123456789',
            role: 'USER'
        });
        console.log('SUCCESS: User created:', user._id);

        // 2. Try create User WITHOUT googleId and NO password (Should Fail)
        console.log('Test 2: Create User NO googleId (No Password) - Should Fail...');
        try {
            await User.create({
                name: 'Fail User',
                email: `fail_${Date.now()}@example.com`,
                role: 'USER'
            });
            throw new Error('FAILURE: Validation did not catch missing password!');
        } catch (err) {
            if (err.errors.password) {
                console.log('SUCCESS: Validation caught missing password');
            } else {
                throw err;
            }
        }

        console.log('USER MODEL GAUTH VALIDATION PASSED!');
        process.exit(0);

    } catch (err) {
        console.error('TEST FAILED:', err);
        process.exit(1);
    }
}

runTest();
