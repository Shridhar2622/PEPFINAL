const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const BASE_URL = 'http://localhost:5000/api/v1';

const log = (msg) => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);

const testUser = {
    name: "Security Test User",
    email: `security_${Date.now()}@example.com`,
    password: "Password123!",
    passwordConfirm: "Password123!",
    role: "USER"
};

async function runTest() {
    try {
        log('Starting Security Verification...');
        const jar = new CookieJar();
        const client = wrapper(axios.create({ baseURL: BASE_URL, jar, withCredentials: true }));

        // 1. Test reCAPTCHA: SUCCESS (Mock Token)
        log('Test 1: Register with Mock Token (Should Succeed)');
        await client.post('/auth/register', {
            ...testUser,
            recaptchaToken: 'mock-token'
        });
        log('SUCCESS: Registration allowed with mock token');

        // 2. Test reCAPTCHA: FAILURE (Missing Token)
        log('Test 2: Register without Token (Should Fail)');
        try {
            await client.post('/auth/register', {
                ...testUser,
                email: `fail_${Date.now()}@example.com`
            });
            throw new Error('FAILURE: Allowed registration without reCAPTCHA token!');
        } catch (err) {
            if (err.response && err.response.status === 400) {
                log('SUCCESS: Blocked registration without token');
            } else {
                throw err;
            }
        }

        // 3. Test Auth Rate Limiter
        log('Test 3: Auth Rate Limiter (Brute Force Simulation)');
        let attempts = 0;
        const maxAttempts = 15; // Limit is 10/hour
        let blocked = false;

        for (let i = 0; i < maxAttempts; i++) {
            try {
                process.stdout.write('.');
                await client.post('/auth/login', {
                    email: testUser.email,
                    password: "WrongPassword"
                });
                attempts++;
            } catch (err) {
                if (err.response && err.response.status === 429) {
                    console.log(`\nSUCCESS: Rate limit hit after ${attempts} attempts`);
                    blocked = true;
                    break;
                }
            }
        }

        if (!blocked) {
            throw new Error(`FAILURE: Rate limiter did not trigger after ${maxAttempts} attempts`);
        }

        log('SECURITY ENHANCEMENTS VERIFIED SUCCESSFULLY!');

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('CRITICAL: Server unreachable');
        } else {
            console.error('TEST FAILED:', error.message);
            if (error.response) {
                console.error('Data:', JSON.stringify(error.response.data, null, 2));
            }
        }
        process.exit(1);
    }
}

runTest();
