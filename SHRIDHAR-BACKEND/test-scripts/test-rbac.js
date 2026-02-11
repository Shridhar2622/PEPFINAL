const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const BASE_URL = 'http://localhost:5000/api/v1';

const log = (msg) => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);

const getClient = () => {
    const jar = new CookieJar();
    return wrapper(axios.create({ baseURL: BASE_URL, jar, withCredentials: true }));
};

const customerUser = {
    name: "RBAC Test Customer",
    email: `rbac_customer_${Date.now()}@example.com`,
    password: "Password123!",
    passwordConfirm: "Password123!",
    role: "USER"
};

const serviceData = {
    title: "Illegal Service",
    description: "I should not be able to create this",
    price: 100,
    category: "Hacking"
};

async function runTest() {
    try {
        log('Starting RBAC Verification...');
        const client = getClient();

        // 1. Register as USER
        await client.post('/auth/register', customerUser);
        log('Registered as USER');

        // 2. Login
        await client.post('/auth/login', { email: customerUser.email, password: customerUser.password });
        log('Logged in as USER');

        // 3. Attempt to Create Service (Should Fail)
        log('Attempting to create Service (Worker Only)...');
        try {
            await client.post('/services', serviceData);
            throw new Error('FAILURE: USER was allowed to create a Service!');
        } catch (error) {
            if (error.response && error.response.status === 403) {
                log('SUCCESS: Service creation blocked (403 Forbidden)');
            } else {
                throw new Error(`FAILURE: Expected 403, got ${error.response ? error.response.status : error.message}`);
            }
        }

        // 4. Attempt to Create Worker Profile (Should Fail)
        log('Attempting to create Worker Profile (Worker Only)...');
        try {
            await client.post('/workers/profile', { bio: "Hacker" });
            throw new Error('FAILURE: USER was allowed to create a Worker Profile!');
        } catch (error) {
            if (error.response && error.response.status === 403) {
                log('SUCCESS: Worker Profile creation blocked (403 Forbidden)');
            } else {
                throw new Error(`FAILURE: Expected 403, got ${error.response ? error.response.status : error.message}`);
            }
        }

        log('RBAC TEST PASSED: Roles are correctly enforcing permissions.');

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('CRITICAL: Server is down or unreachable at ' + BASE_URL);
        } else {
            console.error('TEST FAILED:', error.message);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', JSON.stringify(error.response.data, null, 2));
            }
        }
        process.exit(1);
    }
}

runTest();
