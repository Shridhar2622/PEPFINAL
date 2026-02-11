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
const technicianUser = {
    name: "Test Technician",
    email: `tech_flow_${Date.now()}@example.com`,
    password: "Password123!",
    passwordConfirm: "Password123!",
    role: "TECHNICIAN"
};

const customerUser = {
    name: "Test Customer",
    email: `cust_flow_${Date.now()}@example.com`,
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
        log('Starting Technician Booking Flow Test...');

        const techClient = getClient();
        const customerClient = getClient();
        let serviceId;
        let bookingId;

        // ---------------------------------------------------------
        // 1. Setup Technician & Service
        // ---------------------------------------------------------
        log('--- Step 1: Technician Setup ---');

        // Register Technician (with recaptchaToken)
        await techClient.post('/auth/register', { ...technicianUser, recaptchaToken: 'mock-token' });
        log('Technician Registered');

        // Login Technician
        await techClient.post('/auth/login', { email: technicianUser.email, password: technicianUser.password });
        log('Technician Logged In');

        // Create Profile
        await techClient.post('/technicians/profile', {
            bio: "I fix pipes",
            skills: ["Plumbing"],
            location: { type: "Point", coordinates: [77.5946, 12.9716] }
        });
        log('Technician Profile Created');

        // Create Service
        const serviceRes = await techClient.post('/services', serviceData);
        serviceId = serviceRes.data.data.service._id;
        log('Service Created:', serviceId);


        // ---------------------------------------------------------
        // 2. Customer Booking
        // ---------------------------------------------------------
        log('--- Step 2: Customer Booking ---');

        // Register Customer (with recaptchaToken)
        await customerClient.post('/auth/register', { ...customerUser, recaptchaToken: 'mock-token' });
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
        // 3. Technician Acceptance
        // ---------------------------------------------------------
        log('--- Step 3: Technician Acceptance ---');

        // Check Technician Notifications/Bookings
        const techBookings = await techClient.get('/bookings');
        const pendingBooking = techBookings.data.data.bookings.find(b => b._id === bookingId);

        if (!pendingBooking) throw new Error('Technician cannot see the new booking');
        log('Technician sees the booking');

        // Accept Booking
        const acceptRes = await techClient.patch(`/bookings/${bookingId}/status`, {
            status: 'ACCEPTED'
        });

        if (acceptRes.data.data.booking.status !== 'ACCEPTED') throw new Error('Booking not ACCEPTED');
        log('Booking Accepted by Technician');


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

        await techClient.patch(`/bookings/${bookingId}/status`, {
            status: 'IN_PROGRESS'
        });
        log('Booking IN_PROGRESS');

        await techClient.patch(`/bookings/${bookingId}/status`, {
            status: 'COMPLETED'
        });
        log('Booking COMPLETED');

        log('SUCCESS: Full Technician Booking Lifecycle Verified!');

    } catch (error) {
        console.error('TEST FAILED:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

runTest();
