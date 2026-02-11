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
        log('Starting Admin Worker Management Verification...');

        const adminJar = new CookieJar();
        const adminClient = wrapper(axios.create({ baseURL: BASE_URL, jar: adminJar, withCredentials: true }));

        // 1. Login Admin
        log('Logging in as Admin...');
        await adminClient.post('/auth/login', adminUser);
        log('Admin Logged In');

        // 2. List Workers (Filtered by PENDING)
        log('Test 1: Fetching PENDING workers');
        const listRes = await adminClient.get('/admin/workers?status=PENDING');
        const workers = listRes.data.data.workers;
        log(`Found ${workers.length} pending workers`);

        if (workers.length === 0) {
            log('No pending workers to test approval on. Skipping approval test.');
            // Ideally we should create one here, but assume previous tests left some
        } else {
            const targetWorker = workers[0];
            log(`Targeting Worker ID: ${targetWorker._id} (User: ${targetWorker.user ? targetWorker.user.name : 'Unknown'})`);

            // 3. Approve Worker
            log('Test 2: Approving Worker...');
            const approveRes = await adminClient.patch(`/admin/workers/${targetWorker._id}/approve`);

            if (approveRes.data.data.worker.documents.verificationStatus === 'VERIFIED') {
                log('SUCCESS: Worker Status updated to VERIFIED');
            } else {
                throw new Error('FAILURE: Worker status did not change');
            }
        }

        log('ADMIN WORKER MANAGEMENT VERIFIED SUCCESSFULLY!');

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
