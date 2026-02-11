require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

// We can't easily test HTTP-only cookies with a simple script without a full HTTP client
// So we will verify the Controller Logic directly by mocking req/res objects
// OR easier: We assume the server is running and use 'axios' to hit localhost:5000

const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, baseURL: 'http://localhost:5000/api/v1' }));

const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';

async function runTest() {
    try {
        console.log('--- STARTING AUTH FLOW TEST ---');

        // 1. Register
        console.log(`1. Registering user: ${TEST_EMAIL}`);
        const regRes = await client.post('/auth/register', {
            name: 'Test User',
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            passwordConfirm: TEST_PASSWORD
        });
        console.log('✅ Register Success:', regRes.data.status);

        // 2. Login (Should set cookie in jar)
        console.log('2. Logging in...');
        const loginRes = await client.post('/auth/login', {
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        });
        console.log('✅ Login Success:', loginRes.data.status);
        
        // 3. Get Me (Should use cookie)
        console.log('3. Getting My Profile...');
        const meRes = await client.get('/users/me');
        console.log('✅ Get Me Success. User:', meRes.data.data.user.email);

        // 4. Update Me (Allowed fields)
        console.log('4. Updating Name (Allowed)...');
        const updatedName = `Updated User ${Date.now()}`;
        const updatedEmail = `updated_${Date.now()}@example.com`;
        
        const updateRes = await client.patch('/users/update-me', {
            name: updatedName,
            email: updatedEmail
        });
        console.log('✅ Update Name Success. New Name:', updateRes.data.data.user.name);

        // 5. Update Forbidden Fields (Role/IsActive) using PATCH /update-me
        // WE EXPECT THIS TO FAIL WITH 400 (Validation Error) because Joi doesn't allow these keys.
        console.log('5. Attempting to update Role (Forbidden)...');
        try {
            await client.patch('/users/update-me', {
                role: 'ADMIN',
                isActive: false,
                name: 'Hacker'
            });
            console.error('❌ SECURITY FAIL: Request with forbidden fields should have failed!');
            process.exit(1);
        } catch (err) {
            if (err.response && err.response.status === 400) {
                 console.log('✅ Security Check Passed: Server rejected forbidden fields with 400.');
            } else {
                 console.error('❌ SECURITY FAIL: Unexpected error code', err.response ? err.response.status : err.message);
                 process.exit(1);
            }
        }

        console.log('--- TEST COMPLETED SUCCESSFULLY ---');
    } catch (error) {
        console.error('❌ Test Failed Details:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('URL:', error.config.url);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

runTest();
