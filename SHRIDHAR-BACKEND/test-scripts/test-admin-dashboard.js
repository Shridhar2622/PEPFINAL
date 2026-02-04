const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const BASE_URL = 'http://localhost:5000/api/v1';
const log = (msg) => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);

const adminUser = {
    email: "admin@example.com",
    password: "Password123!",
};

const normalUser = {
    name: "Normal User",
    email: `normie_${Date.now()}@example.com`,
    password: "Password123!",
    passwordConfirm: "Password123!",
    role: "USER"
};

async function runTest() {
    try {
        log('Starting Admin Panel Verification...');

        const adminJar = new CookieJar();
        const adminClient = wrapper(axios.create({ baseURL: BASE_URL, jar: adminJar, withCredentials: true }));

        const userJar = new CookieJar();
        const userClient = wrapper(axios.create({ baseURL: BASE_URL, jar: userJar, withCredentials: true }));

        // 1. Login/Register
        // Login as Admin
        log('Logging in as Admin...');
        try {
            await adminClient.post('/auth/login', adminUser);
            log('Admin Logged In');
        } catch (err) {
            console.error('Admin Login Failed. Did you run seed-admin.js?', err.response ? err.response.data : err.message);
            process.exit(1);
        }

        // Register Normal User (Public API is fine for this)
        log('Registering Normal User...');
        await userClient.post('/auth/register', { ...normalUser, recaptchaToken: 'mock-token' });
        log('Normal User Registered & Logged In');

        // 2. Test Security: User trying to access Admin Dashboard
        log('Test 1: RBAC Security Check (User accessing /admin/dashboard-stats)');
        try {
            await userClient.get('/admin/dashboard-stats');
            throw new Error('FAILURE: Normal user should NOT access admin dashboard');
        } catch (error) {
            if (error.response && error.response.status === 403) {
                log('SUCCESS: Access Denied for Normal User (403)');
            } else {
                throw error; // Unexpected error
            }
        }

        // 3. Test Admin Access
        log('Test 2: Admin Accessing Dashboard');
        const statsRes = await adminClient.get('/admin/dashboard-stats');
        const stats = statsRes.data.data;

        console.log('Stats Received:', stats);

        if (stats.totalUsers >= 1 && stats.totalWorkers >= 0) {
            log('SUCCESS: Admin Dashboard stats retrieved');
        } else {
            console.error('Stats:', stats);
            throw new Error('FAILURE: Stats data missing or invalid');
        }

        log('ADMIN DASHBOARD VERIFIED SUCCESSFULLY!');

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
