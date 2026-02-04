const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const BASE_URL = 'http://localhost:5000/api/v1';

// Utilities
const log = (msg, data) => {
    console.log(`\n[${new Date().toLocaleTimeString()}] ${msg}`);
    if (data) console.log(JSON.stringify(data, null, 2));
};

const getClient = () => {
    const jar = new CookieJar();
    const client = wrapper(axios.create({
        baseURL: BASE_URL,
        jar,
        withCredentials: true
    }));
    return client;
};

// Test Data
const workerUser = {
    name: "Test Worker",
    email: `worker_${Date.now()}@example.com`,
    password: "Password123!",
    passwordConfirm: "Password123!",
    role: "WORKER"
};

const customerUser = {
    name: "Test Customer",
    email: `customer_${Date.now()}@example.com`,
    password: "Password123!",
    passwordConfirm: "Password123!",
    role: "USER"
};

const serviceData = {
    title: "Plumbing Fix",
    description: "Fixing leaky pipes",
    price: 50,
    category: "Plumbing"
};

async function runTest() {
    try {
        log('Starting Booking Flow Test...');

        const workerClient = getClient();
        const customerClient = getClient();
        let serviceId;
        let bookingId;

        // ---------------------------------------------------------
        // 1. Setup Worker & Service
        // ---------------------------------------------------------
        log('--- Step 1: Worker Setup ---');

        // Register Worker
        await workerClient.post('/auth/register', workerUser);
        log('Worker Registered');

        // Login Worker
        await workerClient.post('/auth/login', { email: workerUser.email, password: workerUser.password });
        log('Worker Logged In');

        // Create Profile
        await workerClient.post('/workers/profile', {
            bio: "I fix pipes",
            skills: ["Plumbing"],
            location: { type: "Point", coordinates: [77.5946, 12.9716] }
        });
        log('Worker Profile Created');

        // Create Service
        const serviceRes = await workerClient.post('/services', serviceData);
        serviceId = serviceRes.data.data.service._id;
        log('Service Created:', serviceId);


        // ---------------------------------------------------------
        // 2. Customer Booking
        // ---------------------------------------------------------
        log('--- Step 2: Customer Booking ---');

        // Register Customer
        await customerClient.post('/auth/register', customerUser);
        log('Customer Registered');

        // Login Customer
        await customerClient.post('/auth/login', { email: customerUser.email, password: customerUser.password });
        log('Customer Logged In');

        // Create Booking
        const bookingRes = await customerClient.post('/bookings', {
            serviceId: serviceId,
            scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
            notes: "Please come on time"
        });
        bookingId = bookingRes.data.data.booking._id;
        log('Booking Created:', bookingId);

        // Verify Status PENDING
        if (bookingRes.data.data.booking.status !== 'PENDING') throw new Error('Booking status is not PENDING');


        // ---------------------------------------------------------
        // 3. Worker Acceptance
        // ---------------------------------------------------------
        log('--- Step 3: Worker Acceptance ---');

        // Login Worker (Refresh session if needed, but cookie jar handles it)

        // Check Worker Notifications (Simulated by checking booking list for now, 
        // in real test we could check DB directly but let's stick to API)
        const workerBookings = await workerClient.get('/bookings');
        const pendingBooking = workerBookings.data.data.bookings.find(b => b._id === bookingId);

        if (!pendingBooking) throw new Error('Worker cannot see the new booking');
        log('Worker sees the booking');

        // Accept Booking
        const acceptRes = await workerClient.patch(`/bookings/${bookingId}/status`, {
            status: 'ACCEPTED'
        });

        if (acceptRes.data.data.booking.status !== 'ACCEPTED') throw new Error('Booking not ACCEPTED');
        log('Booking Accepted by Worker');


        // ---------------------------------------------------------
        // 4. Customer Notification Check
        // ---------------------------------------------------------
        log('--- Step 4: Customer Verification ---');

        const customerBookings = await customerClient.get('/bookings');
        const myBooking = customerBookings.data.data.bookings.find(b => b._id === bookingId);

        if (myBooking.status !== 'ACCEPTED') throw new Error('Customer sees wrong status');
        log('Customer sees ACCEPTED status');


        // ---------------------------------------------------------
        // 5. Completion
        // ---------------------------------------------------------
        log('--- Step 5: Completion ---');

        await workerClient.patch(`/bookings/${bookingId}/status`, {
            status: 'IN_PROGRESS'
        });
        log('Booking IN_PROGRESS');

        await workerClient.patch(`/bookings/${bookingId}/status`, {
            status: 'COMPLETED'
        });
        log('Booking COMPLETED');

        log('SUCCESS: Full Booking Lifecycle Verified!');

    } catch (error) {
        console.error('TEST FAILED:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

runTest();
