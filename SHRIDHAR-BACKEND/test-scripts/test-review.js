const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const BASE_URL = 'http://localhost:5000/api/v1';

const log = (msg) => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);

const getClient = () => {
    const jar = new CookieJar();
    return wrapper(axios.create({ baseURL: BASE_URL, jar, withCredentials: true }));
};

const workerUser = {
    name: "Review Worker",
    email: `review_worker_${Date.now()}@example.com`,
    password: "Password123!",
    passwordConfirm: "Password123!",
    role: "WORKER"
};

const customerUser = {
    name: "Review Customer",
    email: `review_customer_${Date.now()}@example.com`,
    password: "Password123!",
    passwordConfirm: "Password123!",
    role: "USER"
};

const serviceData = {
    title: "5 Star Service",
    description: "Best service ever",
    price: 50,
    category: "Cleaning"
};

async function runTest() {
    try {
        log('Starting Review System Verification...');

        // 1. Setup Worker & Service
        const workerClient = getClient();
        await workerClient.post('/auth/register', workerUser);
        await workerClient.post('/auth/login', { email: workerUser.email, password: workerUser.password });
        log('Worker Registered');

        const profileRes = await workerClient.post('/workers/profile', {
            bio: "I am great",
            skills: ["Cleaning"],
            location: { type: "Point", coordinates: [0, 0] }
        });
        const workerProfileId = profileRes.data.data.profile.id || profileRes.data.data.profile._id;

        const svcRes = await workerClient.post('/services', serviceData);
        const serviceId = svcRes.data.data.service._id;
        const workerId = svcRes.data.data.service.worker; // User ID from service population? No, we need to fetch service or assume

        // 2. Setup Customer & Booking
        const customerClient = getClient();
        await customerClient.post('/auth/register', customerUser);
        await customerClient.post('/auth/login', { email: customerUser.email, password: customerUser.password });
        log('Customer Registered');

        const bookingRes = await customerClient.post('/bookings', {
            serviceId,
            scheduledAt: new Date(Date.now() + 86400000),
            notes: "Please be 5 star"
        });
        const bookingId = bookingRes.data.data.booking._id;
        log('Booking Created (PENDING)');

        // 3. Attempt Review (Should FAIL)
        try {
            await customerClient.post(`/bookings/${bookingId}/reviews`, {
                rating: 5,
                review: "Premature review"
            });
            throw new Error('FAILURE: Allowed review on PENDING booking!');
        } catch (err) {
            if (err.response && err.response.status === 400) {
                log('SUCCESS: Blocked review on PENDING booking');
            } else {
                throw err;
            }
        }

        // 4. Move Booking to COMPLETED
        // Worker accepts
        await workerClient.patch(`/bookings/${bookingId}/status`, { status: "ACCEPTED" });
        // Worker starts
        await workerClient.patch(`/bookings/${bookingId}/status`, { status: "IN_PROGRESS" });
        // Worker completes
        await workerClient.patch(`/bookings/${bookingId}/status`, { status: "COMPLETED" });
        log('Booking marked COMPLETED');

        // 5. Attempt Review (Should SUCCEED)
        await customerClient.post(`/bookings/${bookingId}/reviews`, {
            rating: 5,
            review: "Excellent service!"
        });
        log('SUCCESS: Review created');

        // 6. Attempt Duplicate Review (Should FAIL)
        try {
            await customerClient.post(`/bookings/${bookingId}/reviews`, {
                rating: 1,
                review: "Spam review"
            });
            throw new Error('FAILURE: Allowed duplicate review!');
        } catch (err) {
            if (err.response && err.response.status === 400) {
                log('SUCCESS: Blocked duplicate review');
            } else {
                throw err;
            }
        }

        // 7. Verify Worker Rating
        const workerProfileRes = await customerClient.get(`/workers/${workerProfileId}`);
        const avgRating = workerProfileRes.data.data.worker.avgRating;

        if (avgRating === 5) {
            log('SUCCESS: Worker avgRating updated to 5');
        } else {
            throw new Error(`FAILURE: Worker avgRating is ${avgRating}, expected 5`);
        }

        log('REVIEW SYSTEM VERIFIED SUCCESSFULLY!');

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('CRITICAL: Server unreachable');
        } else {
            console.error('TEST FAILED:', error.message);
            if (error.response) {
                console.error('Data:', JSON.stringify(error.response.data, null, 2));
            }
        }
        process.exit(1);
    }
}

runTest();
