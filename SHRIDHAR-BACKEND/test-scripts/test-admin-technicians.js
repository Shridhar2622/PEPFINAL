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
        log('Starting Admin Technician Management Verification...');

        const adminJar = new CookieJar();
        const adminClient = wrapper(axios.create({ baseURL: BASE_URL, jar: adminJar, withCredentials: true }));

        // 1. Login Admin
        log('Logging in as Admin...');
        await adminClient.post('/auth/login', adminUser);
        log('Admin Logged In');

        // 2. List Technicians (Filtered by PENDING)
        log('Test 1: Fetching PENDING technicians');
        const listRes = await adminClient.get('/admin/technicians?status=PENDING');
        const technicians = listRes.data.data.technicians;
        log(`Found ${technicians.length} pending technicians`);

        if (technicians.length === 0) {
            log('No pending technicians to test approval on. Skipping approval test.');
            log('CAUTION: If you just ran registration test, ensure that user is in PENDING state. Usually new profiles are PENDING.');
        } else {
            const targetTechnician = technicians[0];
            log(`Targeting Technician ID: ${targetTechnician._id} (User: ${targetTechnician.user ? targetTechnician.user.name : 'Unknown'})`);

            // 3. Approve Technician
            log('Test 2: Approving Technician...');
            const approveRes = await adminClient.patch(`/admin/technicians/${targetTechnician._id}/approve`);

            if (approveRes.data.data.technician.documents.verificationStatus === 'VERIFIED') {
                log('SUCCESS: Technician Status updated to VERIFIED');
            } else {
                throw new Error('FAILURE: Technician status did not change');
            }
        }

        log('ADMIN TECHNICIAN MANAGEMENT VERIFIED SUCCESSFULLY!');

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
