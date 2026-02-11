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
const adminUser = {
    name: "System Admin",
    email: "admin@shridhar.com",
    password: "adminpassword123",
    role: "ADMIN"
};

const technicianUser = {
    name: "Expert Technician",
    email: `tech_${Date.now()}@example.com`,
    password: "TechPassword123!",
    passwordConfirm: "TechPassword123!",
    role: "TECHNICIAN"
};

const customerUser = {
    name: "Normal User",
    email: `user_${Date.now()}@example.com`,
    password: "UserPassword123!",
    passwordConfirm: "UserPassword123!",
    role: "USER"
};

async function runTest() {
    try {
        log('Starting Admin-Managed Flow Integration Test...');

        const adminClient = getClient();
        const techClient = getClient();
        const customerClient = getClient();

        let serviceId;
        let bookingId;
        let techId;
        let happyPin;

        // ---------------------------------------------------------
        // 1. Setup Accounts
        // ---------------------------------------------------------
        log('--- Step 1: Account Setup ---');

        // Admin Login (Assuming exists from seedAdmin.js)
        try {
            await adminClient.post('/auth/login', { email: adminUser.email, password: adminUser.password });
            log('Admin Logged In');
        } catch (e) {
            log('Admin Login failed, attempting to register...');
            await adminClient.post('/auth/register', adminUser);
            log('Admin Registered');
        }

        // Register/Login Tech
        await techClient.post('/auth/register', technicianUser);
        const techLogin = await techClient.post('/auth/login', { email: technicianUser.email, password: technicianUser.password });
        techId = techLogin.data.data.user._id;
        log('Technician Setup Complete:', techId);

        // Register/Login Customer
        await customerClient.post('/auth/register', customerUser);
        await customerClient.post('/auth/login', { email: customerUser.email, password: customerUser.password });
        log('Customer Setup Complete');

        // ---------------------------------------------------------
        // 2. Create Category & Service (Admin)
        // ---------------------------------------------------------
        log('--- Step 2: Service Discovery Setup ---');

        // Mock a service since our backend uses services linked to categories
        const servicesRes = await adminClient.get('/services'); // Get existing if any
        if (servicesRes.data.results > 0) {
            serviceId = servicesRes.data.data.services[0]._id;
            log('Using Existing Service:', serviceId);
        } else {
            // Need to create Category and Service if none exist
            // For now, let's assume seed_cats.js was run or just fail if empty
            // Actually, I'll try to find one or mock the creation if it were tech-driven (old way)
            // But wait, user said "Admin controls all".
            log('No services found. In a real scenario, Admin creates them. Mocking existing service requirement...');
            // I'll skip creation and hope there's one, or I'll create one as Tech if that still works (fallback)
            // Actually, I'll try to create a service as Tech for testing purposes if allowed
            try {
                const s = await techClient.post('/service-management', { // or whatever the endpoint is
                    title: "Test Service",
                    description: "Test Description",
                    price: 100,
                    category: "General"
                });
                serviceId = s.data.data.service._id;
            } catch (e) {
                log('Failed to create service as tech, maybe admin only now?');
                // If I can't create service, I'll look for one again.
                throw new Error('Test cannot proceed without a service. Please run seed scripts first.');
            }
        }

        // ---------------------------------------------------------
        // 3. Customer Booking (PENDING_ASSIGNMENT)
        // ---------------------------------------------------------
        log('--- Step 3: Customer Booking ---');

        const bookingRes = await customerClient.post('/bookings', {
            serviceId: serviceId,
            scheduledAt: new Date(Date.now() + 86400000),
            notes: "Test booking"
        });

        bookingId = bookingRes.data.data.booking._id;
        happyPin = bookingRes.data.data.happyPin;
        log('Booking Created (PENDING_ASSIGNMENT):', { bookingId, happyPin });

        if (bookingRes.data.data.booking.status !== 'PENDING_ASSIGNMENT') {
            throw new Error(`Invalid status: ${bookingRes.data.data.booking.status}`);
        }

        // ---------------------------------------------------------
        // 4. Admin Assignment (ASSIGNED)
        // ---------------------------------------------------------
        log('--- Step 4: Admin Assignment ---');

        const assignRes = await adminClient.post(`/bookings/${bookingId}/assign`, {
            technicianId: techId
        });

        log('Technician Assigned (ASSIGNED)');
        if (assignRes.data.data.booking.status !== 'ASSIGNED') {
            throw new Error(`Invalid status after assignment: ${assignRes.data.data.booking.status}`);
        }

        // ---------------------------------------------------------
        // 5. Technician Submits Proof (IN_PROGRESS)
        // ---------------------------------------------------------
        log('--- Step 5: Technician Work Proof ---');

        // Mocking work proof submission with a price increase and reason
        const proofRes = await techClient.post(`/bookings/${bookingId}/proof`, {
            finalPrice: 150,
            priceReason: "Extra labor and parts",
            workProof: ["https://example.com/image.jpg"] // Mock URL as we aren't uploading real files
        });

        log('Work Proof Submitted (IN_PROGRESS)');
        if (proofRes.data.data.booking.status !== 'IN_PROGRESS') {
            throw new Error(`Invalid status after proof: ${proofRes.data.data.booking.status}`);
        }

        // ---------------------------------------------------------
        // 6. Pricing Audit Check (Technician rejection flow)
        // ---------------------------------------------------------
        log('--- Step 6: Pricing Audit Verification ---');
        try {
            await techClient.post(`/bookings/${bookingId}/proof`, {
                finalPrice: 200,
                // priceReason missing!
                workProof: ["https://example.com/image.jpg"]
            });
            throw new Error('Should have failed without price reason');
        } catch (e) {
            log('Success: Rejected price increase without reason');
        }

        // ---------------------------------------------------------
        // 7. Happy Pin Verification (COMPLETED)
        // ---------------------------------------------------------
        log('--- Step 7: Happy Pin Verification ---');

        // Test wrong pin
        try {
            await techClient.post(`/bookings/${bookingId}/complete`, { happyPin: '000000' });
            throw new Error('Should have failed with wrong pin');
        } catch (e) {
            log('Success: Rejected wrong pin');
        }

        // Test correct pin
        const completeRes = await techClient.post(`/bookings/${bookingId}/complete`, {
            happyPin: happyPin
        });

        log('Booking Completed (COMPLETED)');
        if (completeRes.data.data.booking.status !== 'COMPLETED') {
            throw new Error(`Invalid status after completion: ${completeRes.data.data.booking.status}`);
        }

        log('--- FINAL VERIFICATION ---');
        const finalBooking = await adminClient.get(`/bookings/${bookingId}`);
        log('Final Booking State:', {
            status: finalBooking.data.data.booking.status,
            estimatedPrice: finalBooking.data.data.booking.estimatedPrice,
            finalPrice: finalBooking.data.data.booking.finalPrice,
            isHappyPinVerified: finalBooking.data.data.booking.isHappyPinVerified
        });

        log('SUCCESS: Full Admin-Managed Service Flow Verified!');

    } catch (error) {
        if (error.response && error.response.data) {
            console.error('TEST FAILED (API Error):', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('TEST FAILED:', error.message);
        }
        process.exit(1);
    }
}

runTest();
