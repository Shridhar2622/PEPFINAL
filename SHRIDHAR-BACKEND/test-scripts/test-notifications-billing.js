const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const BASE_URL = 'http://localhost:5000/api/v1';
const log = (msg) => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);

const testUser = {
    name: "Notif User",
    email: `notif_${Date.now()}@example.com`,
    password: "Password123!",
    passwordConfirm: "Password123!",
    role: "USER"
};

const workerUser = {
    name: "Notif Worker",
    email: `worker_notif_${Date.now()}@example.com`,
    password: "Password123!",
    passwordConfirm: "Password123!",
    role: "WORKER"
};

const serviceData = { title: "Expensive Service", description: "Test", price: 500, category: "Plumbing" };

async function runTest() {
    try {
        log('Starting Notification & Billing Verification...');
        const jar = new CookieJar();
        const client = wrapper(axios.create({ baseURL: BASE_URL, jar, withCredentials: true }));

        // 1. Setup
        await client.post('/auth/register', { ...testUser, recaptchaToken: 'mock-token' });

        const workerJar = new CookieJar();
        const workerClient = wrapper(axios.create({ baseURL: BASE_URL, jar: workerJar, withCredentials: true }));
        await workerClient.post('/auth/register', { ...workerUser, recaptchaToken: 'mock-token' });
        await workerClient.post('/workers/profile', { bio: "Msg", skills: ["Plumbing"], location: { type: "Point", coordinates: [0, 0] } });

        const svcRes = await workerClient.post('/services', serviceData);
        const serviceId = svcRes.data.data.service._id;

        // 2. Billing History Test
        log('Test 1: Booking Price Snapshot');
        const bookRes = await client.post('/bookings', {
            serviceId,
            scheduledAt: new Date(Date.now() + 86400000)
        });
        const booking = bookRes.data.data.booking;

        if (booking.price === 500) {
            log('SUCCESS: Booking price snapshot correct (500)');
        } else {
            throw new Error(`FAILURE: Booking price mismatch. Expected 500, got ${booking.price}`);
        }

        // 3. Notification Persistence Test (Worker Side)
        // Creating a booking should trigger a notification to the WORKER
        log('Test 2: Notification Persistence (Worker)');

        const notifRes = await workerClient.get('/notifications');
        const notifications = notifRes.data.data.notifications;

        if (notifications.length > 0 && notifications[0].type === 'BOOKING_REQUEST') {
            log('SUCCESS: Notification persisted and retrieved');
            const notifId = notifications[0]._id;

            // 4. Mark as Read
            log('Test 3: Mark Notification Read');
            const readRes = await workerClient.patch(`/notifications/${notifId}/read`);
            if (readRes.data.data.notification.isRead === true) {
                log('SUCCESS: Notification marked as read');
            } else {
                throw new Error('FAILURE: isRead status not updated');
            }

        } else {
            throw new Error('FAILURE: No notification found for worker');
        }

        log('NOTIFICATIONS & BILLING VERIFIED SUCCESSFULLY!');

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
