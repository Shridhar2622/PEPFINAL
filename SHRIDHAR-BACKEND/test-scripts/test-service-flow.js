require('dotenv').config();
const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, baseURL: 'http://localhost:5000/api/v1' }));

const WORKER_EMAIL = `worker_svc_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';

async function runTest() {
    try {
        console.log('--- STARTING SERVICE FLOW TEST ---');

        // 1. Register Worker
        console.log('1. Registering Worker...');
        await client.post('/auth/register', {
            name: 'Service Worker',
            email: WORKER_EMAIL,
            password: TEST_PASSWORD,
            passwordConfirm: TEST_PASSWORD,
            role: 'WORKER'
        });
        console.log('✅ Worker Registered');

        // 2. Create Service
        console.log('2. Creating Service...');
        const svcRes = await client.post('/services', {
            title: 'Leaky Faucet Fix',
            description: 'Expert fixing of leaky faucets',
            price: 50,
            category: 'Plumbing'
        });
        const serviceId = svcRes.data.data.service._id;
        console.log('✅ Service Created. ID:', serviceId);

        // 3. List Services (Public)
        console.log('3. Searching Services...');
        const searchRes = await client.get('/services?search=Faucet');
        if (searchRes.data.results > 0) {
            console.log(`✅ Search Found ${searchRes.data.results} services.`);
        } else {
            console.error('❌ Search Failed: No services found.');
            process.exit(1);
        }

        // 4. Update Service
        console.log('4. Updating Service Price...');
        const updateRes = await client.patch(`/services/${serviceId}`, {
            price: 75
        });
        console.log('✅ Updated Price:', updateRes.data.data.service.price);

        // 5. Delete Service
        console.log('5. Deleting Service...');
        await client.delete(`/services/${serviceId}`);
        console.log('✅ Service Deleted');

        // Verify Deletion
        try {
            await client.get(`/services/${serviceId}`);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                 console.log('✅ Verified: Service is gone (404).');
            } else {
                 console.error('❌ Deletion Verification Failed:', err.message);
                 process.exit(1);
            }
        }

        console.log('--- TEST COMPLETED SUCCESSFULLY ---');
    } catch (error) {
        console.error('❌ Test Failed Details:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

runTest();
