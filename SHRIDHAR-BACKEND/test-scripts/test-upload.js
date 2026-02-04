const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api/v1';

const log = (msg) => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);

const getClient = () => {
    const jar = new CookieJar();
    return wrapper(axios.create({ baseURL: BASE_URL, jar, withCredentials: true }));
};

const workerUser = {
    name: "Upload Test Worker",
    email: `upload_worker_${Date.now()}@example.com`,
    password: "Password123!",
    passwordConfirm: "Password123!",
    role: "WORKER"
};

async function runTest() {
    try {
        log('Starting Upload Validation...');
        const client = getClient();

        // 1. Register & Login
        await client.post('/auth/register', workerUser);
        await client.post('/auth/login', { email: workerUser.email, password: workerUser.password });
        log('Worker Logged In');

        // 2. Prepare Form Data
        const form = new FormData();
        form.append('bio', 'I have a cool photo');
        form.append('skills', 'Modeling');
        form.append('location[type]', 'Point');
        form.append('location[coordinates][0]', 12.0);
        form.append('location[coordinates][1]', 13.0);

        // Attach file
        const filePath = path.join(__dirname, 'sample.jpg');
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, 'fake image content'); // minimal content
        }
        form.append('profilePhoto', fs.createReadStream(filePath), {
            filename: 'sample.jpg',
            contentType: 'image/jpeg'
        });

        // 3. Upload Profile
        log('Uploading Profile with Photo...');
        const res = await client.post('/workers/profile', form, {
            headers: form.getHeaders()
        });

        const profile = res.data.data.profile;
        if (!profile.profilePhoto || !profile.profilePhoto.includes('/public/uploads/workers/')) {
            throw new Error('Profile photo URL is missing or incorrect: ' + profile.profilePhoto);
        }

        log('SUCCESS: Profile created with photo: ' + profile.profilePhoto);

    } catch (error) {
        console.error('TEST FAILED:', error.message);
        if (error.response) {
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        }
        process.exit(1);
    }
}

runTest();
