require('dotenv').config();
const mongoose = require('mongoose');

console.log('1. Loading Models...');
try {
    require('../src/models/User');
    require('../src/models/WorkerProfile');
    require('../src/models/Service');
    require('../src/models/Booking');
    require('../src/models/Notification');
    console.log('✅ All Models Loaded Successfully');
} catch (err) {
    console.error('❌ Model Loading Failed:', err);
    process.exit(1);
}

console.log('2. Loading Services...');
try {
    require('../src/services/notificationService');
    console.log('✅ Services Loaded Successfully');
} catch (err) {
    console.error('❌ Service Loading Failed:', err);
    process.exit(1);
}

console.log('3. Loading App & Middlewares...');
try {
    require('../src/app');
    console.log('✅ App & Middlewares Loaded Successfully');
} catch (err) {
    console.error('❌ App Loading Failed:', err);
    process.exit(1);
}

console.log('✅ SYSTEM CHECK PASSED: Codebase structure is valid.');
process.exit(0);
