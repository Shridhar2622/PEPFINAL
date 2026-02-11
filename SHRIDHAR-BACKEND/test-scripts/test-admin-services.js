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
        log('Starting Admin Service Management Verification...');

        const adminJar = new CookieJar();
        const adminClient = wrapper(axios.create({ baseURL: BASE_URL, jar: adminJar, withCredentials: true }));

        // 1. Login Admin
        log('Logging in as Admin...');
        await adminClient.post('/auth/login', adminUser);

        // 2. List Services
        log('Test 1: Fetching all services');
        const listRes = await adminClient.get('/admin/services');
        const services = listRes.data.data.services;
        log(`Found ${services.length} services`);

        if (services.length === 0) {
            log('No services found. Please create a service first via worker flow (or run previous tests). Skipping toggle test.');
        } else {
            const targetService = services[0];
            const originalStatus = targetService.isActive;
            log(`Targeting Service ID: ${targetService._id} (Current Status: ${originalStatus})`);

            // 3. Toggle Status (Flip it)
            const newStatus = !originalStatus;
            log(`Test 2: Toggling status to ${newStatus}...`);

            const toggleRes = await adminClient.patch(`/admin/services/${targetService._id}/status`, {
                isActive: newStatus
            });

            if (toggleRes.data.data.service.isActive === newStatus) {
                log(`SUCCESS: Service status updated to ${newStatus}`);
            } else {
                throw new Error('FAILURE: Service status did not update');
            }

            // 4. Toggle Back (Restoration)
            log(`Test 3: Restoring status to ${originalStatus}...`);
            await adminClient.patch(`/admin/services/${targetService._id}/status`, {
                isActive: originalStatus
            });
            log('SUCCESS: Service status restored');
        }

        log('ADMIN SERVICE MANAGEMENT VERIFIED SUCCESSFULLY!');

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
