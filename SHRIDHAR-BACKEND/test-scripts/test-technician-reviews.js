const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const BASE_URL = 'http://localhost:5000/api/v1';

const log = (msg) => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);

const getClient = () => {
    const jar = new CookieJar();
    return wrapper(axios.create({ baseURL: BASE_URL, jar, withCredentials: true }));
};

const technicianUser = {
    name: "Review Technician",
    email: `review_tech_${Date.now()}@example.com`,
    password: "Password123!",
    passwordConfirm: "Password123!",
    role: "TECHNICIAN"
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

        // 1. Setup Technician & Service
        const techClient = getClient();
        // Add recaptchaToken
        const techRegRes = await techClient.post('/auth/register', { ...technicianUser, recaptchaToken: 'mock-token' });
        // Capture User ID from registration response (Review is linked to User, not Profile)
        const technicianUserId = techRegRes.data.data.user._id || techRegRes.data.data.user.id;

        await techClient.post('/auth/login', { email: technicianUser.email, password: technicianUser.password });
        log('Technician Registered');

        const profileRes = await techClient.post('/technicians/profile', {
            bio: "I am great",
            skills: ["Cleaning"],
            location: { type: "Point", coordinates: [0, 0] }
        });
        const technicianProfileId = profileRes.data.data.profile.id || profileRes.data.data.profile._id;

        const svcRes = await techClient.post('/services', serviceData);
        const serviceId = svcRes.data.data.service._id;

        // 2. Setup Customer & Booking
        const customerClient = getClient();
        // Add recaptchaToken
        await customerClient.post('/auth/register', { ...customerUser, recaptchaToken: 'mock-token' });
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
        // Technician accepts
        await techClient.patch(`/bookings/${bookingId}/status`, { status: "ACCEPTED" });
        // Technician starts
        await techClient.patch(`/bookings/${bookingId}/status`, { status: "IN_PROGRESS" });
        // Technician completes
        await techClient.patch(`/bookings/${bookingId}/status`, { status: "COMPLETED" });
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

        // 7. Verify Technician Rating
        // For Rating, we look at the Profile
        const technicianProfileRes = await customerClient.get(`/technicians/${technicianProfileId}`);
        const avgRating = technicianProfileRes.data.data.technician.avgRating;

        if (avgRating === 5) {
            log('SUCCESS: Technician avgRating updated to 5');
        } else {
            throw new Error(`FAILURE: Technician avgRating is ${avgRating}, expected 5`);
        }

        // 8. Verify Technician Reviews List
        // For Reviews List, we query by Technician User ID
        const reviewsRes = await customerClient.get(`/technicians/${technicianUserId}/reviews`);
        if (reviewsRes.data.results > 0) {
            log('SUCCESS: Reviews list fetched correctly');
        } else {
            throw new Error('FAILURE: Could not fetch reviews list');
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
