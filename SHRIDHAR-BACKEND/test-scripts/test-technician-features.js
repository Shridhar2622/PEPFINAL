const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:5000/api/v1';
const log = (msg) => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);

const technicianUser = {
    name: "Technician Feature Test",
    email: `tf_${Date.now()}@example.com`,
    password: "Password123!",
    passwordConfirm: "Password123!",
    role: "TECHNICIAN"
};

const customerUser = {
    name: "Cust Feature Test",
    email: `cf_${Date.now()}@example.com`,
    password: "Password123!",
    passwordConfirm: "Password123!",
    role: "USER"
};

const serviceData = { title: "Sort Service", description: "Test", price: 100, category: "Plumbing" };

async function runTest() {
    try {
        log('Starting Technician Features Verification...');
        const techJar = new CookieJar();
        const techClient = wrapper(axios.create({ baseURL: BASE_URL, jar: techJar, withCredentials: true }));

        const custJar = new CookieJar();
        const custClient = wrapper(axios.create({ baseURL: BASE_URL, jar: custJar, withCredentials: true }));

        // Register Users
        log('Registering Technician...');
        await techClient.post('/auth/register', { ...technicianUser, recaptchaToken: 'mock-token' });

        log('Creating Technician Profile...');
        await techClient.post('/technicians/profile', { bio: "Msg", skills: ["Plumbing"], location: { type: "Point", coordinates: [0, 0] } });

        log('Registering Customer...');
        await custClient.post('/auth/register', { ...customerUser, recaptchaToken: 'mock-token' });

        // Create Service
        log('Creating Service...');
        const svcRes = await techClient.post('/services', serviceData);
        const serviceId = svcRes.data.data.service._id;

        // 1. Test Documents Upload
        log('Test 1: Documents Upload');
        const form = new FormData();
        // Create a dummy file on the fly if needed, or use existing
        if (!fs.existsSync('dummy.jpg')) fs.writeFileSync('dummy.jpg', 'dummy content');

        form.append('aadharCard', fs.createReadStream('dummy.jpg'));

        const docRes = await techClient.post('/technicians/documents', form, {
            headers: form.getHeaders()
        });

        if (docRes.data.data.profile.documents.aadharCard) {
            log('SUCCESS: Document uploaded and profile updated');
        } else {
            throw new Error('FAILURE: Document path not saved');
        }

        // 2. Test Auto-Cancel (Past Booking) - Skipped as per original test

        // 3. Test Sorting (Earliest First)
        log('Test 3: Request Sorting');
        const now = Date.now();
        // Booking A: 2 days later
        await custClient.post('/bookings', { serviceId, scheduledAt: new Date(now + 172800000), notes: 'LATER' });
        // Booking B: 1 day later (Sooner)
        await custClient.post('/bookings', { serviceId, scheduledAt: new Date(now + 86400000), notes: 'SOONER' });

        const listRes = await techClient.get('/bookings?status=PENDING');
        const bookings = listRes.data.data.bookings;

        if (bookings[0].notes === 'SOONER') {
            log('SUCCESS: Sorted by Earliest Date (SOONER came first)');
        } else {
            throw new Error(`FAILURE: Sorting wrong. First item notes: ${bookings[0].notes}`);
        }

        // 4. Test Earnings Stats
        log('Test 4: Earnings Stats');
        // Complete the 'SOONER' booking
        const bookingId = bookings[0]._id;
        await techClient.patch(`/bookings/${bookingId}/status`, { status: 'ACCEPTED' });
        await techClient.patch(`/bookings/${bookingId}/status`, { status: 'IN_PROGRESS' });
        await techClient.patch(`/bookings/${bookingId}/status`, { status: 'COMPLETED' });

        const statsRes = await techClient.get('/bookings/stats');
        const stats = statsRes.data.data.stats;

        if (stats.totalEarnings === 100 && stats.completedJobs === 1) {
            log('SUCCESS: Earnings calculated correctly (100)');
        } else {
            throw new Error(`FAILURE: Earnings mismatch. Got ${JSON.stringify(stats)}`);
        }

        log('TECHNICIAN FEATURES VERIFIED SUCCESSFULLY!');

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('CRITICAL: Server unreachable');
        } else {
            console.error('TEST FAILED:', error.message);
            if (error.response) {
                // console.error('Data:', JSON.stringify(error.response.data, null, 2));
                console.error('Status:', error.response.status);
                if (error.response.data && error.response.data.stack) {
                    console.error('Stack:', error.response.data.stack); // Print stack directly
                } else {
                    console.error('Data (truncated):', JSON.stringify(error.response.data).substring(0, 500));
                }
            } else {
                console.error(error);
            }
        }
        process.exit(1);
    }
}

runTest();
