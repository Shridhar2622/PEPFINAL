const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const BASE_URL = 'http://localhost:5000/api/v1';
const log = (msg) => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);

const adminUser = {
    email: "admin@example.com",
    password: "Password123!",
};

const targetUser = {
    name: "Target User",
    email: `target_${Date.now()}@example.com`,
    password: "Password123!",
    passwordConfirm: "Password123!",
    role: "USER"
};

async function runTest() {
    try {
        log('Starting Admin User Management Verification...');

        const adminJar = new CookieJar();
        const adminClient = wrapper(axios.create({ baseURL: BASE_URL, jar: adminJar, withCredentials: true }));

        const userJar = new CookieJar();
        const userClient = wrapper(axios.create({ baseURL: BASE_URL, jar: userJar, withCredentials: true }));

        // 1. Setup
        log('Logging in as Admin...');
        await adminClient.post('/auth/login', adminUser);

        log('Registering Target User...');
        const regRes = await userClient.post('/auth/register', { ...targetUser, recaptchaToken: 'mock-token' });
        const targetId = regRes.data.data.user._id; // Assuming response structure
        log(`Target User ID: ${targetId}`);

        // 2. Disable User
        log('Test 1: Disabling User...');
        await adminClient.patch(`/admin/users/${targetId}/status`, { isActive: false });
        log('User Disabled via Admin API');

        // 3. Verify Login Blocked
        log('Test 2: Verifying Login Block...');
        try {
            await userClient.post('/auth/login', { email: targetUser.email, password: targetUser.password });
            throw new Error('FAILURE: Disabled user should NOT be able to login');
        } catch (error) {
            if (error.response && error.response.status === 403) {
                log('SUCCESS: Login Denied (403 or similar) for disabled user');
            } else {
                throw error; // Unexpected error
            }
        }

        // 4. Enable User
        log('Test 3: Re-enabling User...');
        await adminClient.patch(`/admin/users/${targetId}/status`, { isActive: true });
        log('User Enabled via Admin API');

        // 5. Verify Login Allowed
        log('Test 4: Verifying Login Access...');
        await userClient.post('/auth/login', { email: targetUser.email, password: targetUser.password });
        log('SUCCESS: Re-enabled user logged in successfully');

        log('ADMIN USER MANAGEMENT VERIFIED SUCCESSFULLY!');

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
