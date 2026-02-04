const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const BASE_URL = 'http://localhost:5000/api/v1';
const log = (msg) => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);

const testUser = {
    name: "Feature Test User",
    email: `feature_${Date.now()}@example.com`,
    password: "Password123!",
    passwordConfirm: "Password123!",
    role: "USER"
};

const workerUser = {
    name: "Feature Worker",
    email: `worker_feat_${Date.now()}@example.com`,
    password: "Password123!",
    passwordConfirm: "Password123!",
    role: "WORKER"
};

const serviceData = { title: "Feature Service", description: "Test", price: 100, category: "Plumbing" };

async function runTest() {
    try {
        log('Starting Phase 2 User Features Verification...');
        const jar = new CookieJar();
        const client = wrapper(axios.create({ baseURL: BASE_URL, jar, withCredentials: true }));

        // 1. Register User
        await client.post('/auth/register', { ...testUser, recaptchaToken: 'mock-token' });
        log('User Registered');

        // 2. Profile Update (Avatar & Location)
        log('Test 1: Update Profile (Avatar, Phone, Location)');
        const updateRes = await client.patch('/users/update-me', {
            phone: '1234567890',
            address: '123 Test St',
            profilePhoto: 'https://example.com/avatar.png',
            location: {
                type: 'Point',
                coordinates: [77.5946, 12.9716] // Bangalore
            }
        });

        if (updateRes.data.data.user.phone === '1234567890' &&
            updateRes.data.data.user.location.coordinates[0] === 77.5946) {
            log('SUCCESS: Profile updated successfully');
        } else {
            throw new Error('FAILURE: Profile update mismatch');
        }

        // 3. Setup Worker & Service for Booking Tests
        const workerJar = new CookieJar();
        const workerClient = wrapper(axios.create({ baseURL: BASE_URL, jar: workerJar, withCredentials: true }));
        await workerClient.post('/auth/register', { ...workerUser, recaptchaToken: 'mock-token' });
        await workerClient.post('/workers/profile', { bio: "Msg", skills: ["Plumbing"], location: { type: "Point", coordinates: [0, 0] } });
        const svcRes = await workerClient.post('/services', serviceData);
        const serviceId = svcRes.data.data.service._id;

        // 4. Booking Validation: Past Date
        log('Test 2: Booking with Past Date (Should Fail)');
        try {
            await client.post('/bookings', {
                serviceId,
                scheduledAt: new Date(Date.now() - 3600000) // 1 hour ago
            });
            throw new Error('FAILURE: Allowed booking in the past!');
        } catch (err) {
            if (err.response && err.response.status === 400) { // Joi usually returns 400
                log('SUCCESS: Past booking blocked');
            } else {
                throw err;
            }
        }

        // 5. Booking Cancellation
        log('Test 3: Customer Cancel Booking');
        // Create valid booking
        const bookRes = await client.post('/bookings', {
            serviceId,
            scheduledAt: new Date(Date.now() + 86400000) // Tomorrow
        });
        const bookingId = bookRes.data.data.booking._id;

        // Cancel it
        const cancelRes = await client.patch(`/bookings/${bookingId}/status`, { status: 'CANCELLED' });
        if (cancelRes.data.data.booking.status === 'CANCELLED') {
            log('SUCCESS: Booking cancelled by customer');
        } else {
            throw new Error('FAILURE: Booking status not updated to CANCELLED');
        }

        log('USER FEATURES VERIFIED SUCCESSFULLY!');

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('CRITICAL: Server unreachable');
        } else {
            console.error('TEST FAILED:', error.message);
            if (error.response) {
                console.error('Data:', JSON.stringify(error.response.data, null, 2));
            } else {
                console.error(error);
            }
        }
        process.exit(1);
    }
}

runTest();
