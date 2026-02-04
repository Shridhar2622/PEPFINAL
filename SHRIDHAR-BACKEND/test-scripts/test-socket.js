const io = require('socket.io-client');
const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const BASE_URL = 'http://localhost:5000/api/v1';

const log = (msg) => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);

const getClient = () => {
    const jar = new CookieJar();
    return wrapper(axios.create({ baseURL: BASE_URL, jar, withCredentials: true }));
};

const workerUser = {
    name: "Socket Test Worker",
    email: `socket_worker_${Date.now()}@example.com`,
    password: "Password123!",
    passwordConfirm: "Password123!",
    role: "WORKER"
};

const customerUser = {
    name: "Socket Test Customer",
    email: `socket_customer_${Date.now()}@example.com`,
    password: "Password123!",
    passwordConfirm: "Password123!",
    role: "USER"
};

const serviceData = {
    title: "Instant Service",
    description: "Testing sockets",
    price: 10,
    category: "Test"
};

async function runTest() {
    try {
        log('Starting Socket Verification...');

        // 1. Setup Worker
        const workerClient = getClient();
        const registerRes = await workerClient.post('/auth/register', workerUser);
        await workerClient.post('/auth/login', { email: workerUser.email, password: workerUser.password });
        log('Worker Logged In');

        // Create Profile & Service
        await workerClient.post('/workers/profile', {
            bio: "Socket Tester",
            skills: ["Testing"],
            location: { type: "Point", coordinates: [0, 0] }
        });
        const svcRes = await workerClient.post('/services', serviceData);
        const serviceId = svcRes.data.data.service._id;

        // 2. Get Token (from cookie jar or register response)
        // Since we use httpOnly cookies, the client library needs to send cookies.
        // Socket.IO node client doesn't automatically pick up cookies from tough-cookie jar easily
        // BUT we programmed socket.js to check handshake.headers.cookie

        // Extract cookie string
        const cookies = await workerClient.defaults.jar.getCookieString('http://localhost:5000');

        // 3. Connect Socket
        log('Connecting to Socket.IO...');
        const socket = io('http://localhost:5000', {
            extraHeaders: {
                Cookie: cookies
            },
            transports: ['websocket']
        });

        socket.on('connect', () => {
            log('Socket Connected! ID: ' + socket.id);

            // 4. Trigger Notification (Customer Booking)
            triggerBooking(serviceId);
        });

        socket.on('connect_error', (err) => {
            console.error('Socket Connection Error:', err.message);
            process.exit(1);
        });

        socket.on('notification', (data) => {
            log('RECEIVED NOTIFICATION: ' + data.title);
            log('Message: ' + data.message);

            if (data.type === 'BOOKING_REQUEST') {
                log('SUCCESS: Real-time notification verified!');
                socket.disconnect();
                process.exit(0);
            }
        });

        // Timeout
        setTimeout(() => {
            console.error('TIMEOUT: No notification received in 10s');
            process.exit(1);
        }, 10000);

    } catch (error) {
        console.error('TEST SETUP FAILED:', error.message);
        process.exit(1);
    }
}

async function triggerBooking(serviceId) {
    try {
        log('Triggering Booking...');
        const customerClient = getClient();
        await customerClient.post('/auth/register', customerUser);
        await customerClient.post('/auth/login', { email: customerUser.email, password: customerUser.password });

        await customerClient.post('/bookings', {
            serviceId,
            scheduledAt: new Date(Date.now() + 86400000),
            notes: "Socket Test"
        });
        log('Booking Created (Notification should fire)');
    } catch (error) {
        console.error('Trigger Failed:', error.response?.data || error.message);
    }
}

runTest();
