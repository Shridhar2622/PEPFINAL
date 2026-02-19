const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Reason = require('./models/Reason');

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGO_URI;

const reasons = [
    { reason: 'Spare Parts replaced', type: 'REGULAR' },
    { reason: 'Extra labor required', type: 'REGULAR' },
    { reason: 'Gas filling', type: 'REGULAR' },
    { reason: 'Component repair', type: 'REGULAR' },
    { reason: 'High distance travel', type: 'TRANSPORT' },
    { reason: 'Overnight stay required', type: 'TRANSPORT' },
    { reason: 'Heavy equipment used', type: 'TRANSPORT' }
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB...');

        await Reason.deleteMany();
        console.log('Cleared existing reasons...');

        await Reason.insertMany(reasons);
        console.log('Seeded reasons successfully!');

        process.exit();
    } catch (err) {
        console.error('Error seeding DB:', err);
        process.exit(1);
    }
};

seedDB();
