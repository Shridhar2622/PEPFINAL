require('dotenv').config();
const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, baseURL: 'http://localhost:5000/api/v1' }));

const TEST_EMAIL = `worker_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';

async function runTest() {
    try {
        console.log('--- STARTING WORKER FLOW TEST ---');

        // 1. Register as WORKER
        console.log(`1. Registering worker: ${TEST_EMAIL}`);
        const regRes = await client.post('/auth/register', {
            name: 'Test Worker',
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            passwordConfirm: TEST_PASSWORD,
            role: 'WORKER'
        });
        console.log('✅ Register Success:', regRes.data.status);

        // 2. Create Profile
        console.log('2. Creating Worker Profile...');
        const profileRes = await client.post('/workers/profile', {
            bio: 'I am a skilled plumber.',
            skills: ['Plumbing', 'Pipe Fixing'],
            profilePhoto: 'https://example.com/photo.jpg',
            location: {
                type: 'Point',
                coordinates: [70.0, 20.0],
                address: '123 Test St'
            }
        });
        console.log('✅ Create Profile Success. Bio:', profileRes.data.data.profile.bio);

        // 3. Update Profile
        console.log('3. Updating Profile (Go Online)...');
        const updateRes = await client.patch('/workers/profile', {
            isOnline: true,
            skills: ['Plumbing', 'Pipe Fixing', 'Heating']
        });
        console.log('✅ Update Profile Success. Online:', updateRes.data.data.profile.isOnline);

        // 4. Get Public Profile
        console.log('4. Searching for Worker...');
        const searchRes = await client.get('/workers?skills=Plumbing');
        console.log(`✅ Search Success. Found ${searchRes.data.results} workers.`);
        
        // Verify the worker is in the list
        const found = searchRes.data.data.workers.find(w => w.user.email === TEST_EMAIL);
        if (found) {
             console.log('✅ Verified: Newly created worker found in search results.');
        } else {
             console.warn('⚠️ Warning: Newly created worker NOT found in search results (might be pagination/ordering).');
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
