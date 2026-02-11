const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const BASE_URL = 'http://localhost:5000/api/v1';
const log = (msg) => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);

const adminUser = {
    email: "admin@example.com",
    password: "Password123!",
};

async function runTest() {
    try {
        log('Starting Admin Booking Management Verification...');

        const adminJar = new CookieJar();
        const adminClient = wrapper(axios.create({ baseURL: BASE_URL, jar: adminJar, withCredentials: true }));

        // 1. Login Admin
        log('Logging in as Admin...');
        await adminClient.post('/auth/login', adminUser);

        // 2. List Bookings
        log('Test 1: Fetching all bookings');
        const listRes = await adminClient.get('/admin/bookings');
        const bookings = listRes.data.data.bookings;
        log(`Found ${bookings.length} bookings`);

        // Find a suitable candidate (PENDING or CONFIRMED)
        const targetBooking = bookings.find(b => b.status === 'PENDING' || b.status === 'CONFIRMED');

        if (!targetBooking) {
            log('No cancellable bookings found (all are completed/cancelled). Skipping cancel test.');
        } else {
            log(`Targeting Booking ID: ${targetBooking._id} (Status: ${targetBooking.status})`);

            // 3. Cancel Booking
            log('Test 2: Force canceling booking...');
            const cancelRes = await adminClient.patch(`/admin/bookings/${targetBooking._id}/cancel`);

            if (cancelRes.data.data.booking.status === 'CANCELLED') {
                log('SUCCESS: Booking status updated to CANCELLED');
            } else {
                throw new Error('FAILURE: Booking status did not update');
            }
        }

        log('ADMIN BOOKING MANAGEMENT VERIFIED SUCCESSFULLY!');

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('CRITICAL: Server unreachable');
        } else {
            console.error('TEST FAILED:', error.message);
            if (error.response) {
                console.error('Status:', error.response.status);
                if (error.response.data && error.response.data.message) {
                    console.error('Msg:', error.response.data.message);
                }
            } else {
                console.error(error);
            }
        }
        process.exit(1);
    }
}

runTest();
