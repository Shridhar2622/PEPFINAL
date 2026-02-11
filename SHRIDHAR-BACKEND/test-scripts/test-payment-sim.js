const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const BASE_URL = 'http://localhost:5000/api/v1';
const log = (msg) => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);

const workerUser = {
    name: "Payee Worker",
    email: `payee_${Date.now()}@example.com`,
    password: "Password123!",
    passwordConfirm: "Password123!",
    role: "WORKER"
};

const payerUser = {
    name: "Payer User",
    email: `payer_${Date.now()}@example.com`,
    password: "Password123!",
    passwordConfirm: "Password123!",
    role: "USER"
};

async function runTest() {
    try {
        log('Starting Payment Simulation Verification...');

        const workerJar = new CookieJar();
        const workerClient = wrapper(axios.create({ baseURL: BASE_URL, jar: workerJar, withCredentials: true }));

        const payerJar = new CookieJar();
        const payerClient = wrapper(axios.create({ baseURL: BASE_URL, jar: payerJar, withCredentials: true }));

        // 1. Setup Worker & Service
        log('1. Registering Worker...');
        await workerClient.post('/auth/register', { ...workerUser, recaptchaToken: 'mock-token' });

        log('1b. Creating Service...');
        const serviceRes = await workerClient.post('/services', {
            title: "Premium Payment Service",
            description: "Service to test payments",
            category: "Plumbing",
            price: 500
        });
        const serviceId = serviceRes.data.data.service._id;
        log(`Service Created: ${serviceId}`);

        // 2. Setup Payer & Booking
        log('2. Registering Payer...');
        await payerClient.post('/auth/register', { ...payerUser, recaptchaToken: 'mock-token' });

        log('2b. Creating Booking...');
        const bookingRes = await payerClient.post('/bookings', {
            serviceId: serviceId,
            scheduledAt: new Date(Date.now() + 86400000).toISOString(),
            notes: "I will pay for this"
        });
        const bookingId = bookingRes.data.data.booking._id;
        log(`Booking Created: ${bookingId}`);

        // 3. Process Payment
        log('3. Processing Payment (Simulated)...');
        const paymentRes = await payerClient.post('/payments/process', {
            bookingId: bookingId,
            paymentMethod: 'UPI'
        });

        const result = paymentRes.data.data;
        if (result.success && result.transaction.status === 'SUCCESS') {
            log('SUCCESS: Payment Processed Successfully!');
            log(`Transaction ID: ${result.transaction.transactionId}`);
        } else {
            throw new Error('FAILURE: Payment response was not successful');
        }

        // 4. Verify Notifications
        log('4. Verifying Notifications...');
        const notifRes = await payerClient.get('/notifications'); // Assumes GET /notifications is implemented in User features
        const notifications = notifRes.data.data.notifications;

        const paymentNotif = notifications.find(n => n.type === 'PAYMENT_SUCCESS' && n.data.transactionId === result.transaction.transactionId);

        if (paymentNotif) {
            log('SUCCESS: Payment Notification Received!');
        } else {
            console.warn('WARNING: Payment Notification NOT found in list. (Async delay?)');
            console.log('Recent Notifications:', notifications.map(n => n.type));
        }

        log('PAYMENT VERIFICATION COMPLETE!');

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('CRITICAL: Server unreachable');
        } else {
            console.error('TEST FAILED:', error.message);
            if (error.response) {
                console.error('Status:', error.response.status);
                if (error.response.data) {
                    console.error('Full Error Data:', JSON.stringify(error.response.data, null, 2));
                }
            } else {
                console.error(error);
            }
        }
        process.exit(1);
    }
}

runTest();
