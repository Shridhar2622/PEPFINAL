const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Adjust path to .env if script is in scripts/ folder
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Category = require('../src/models/Category');

const run = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI not found');
        }
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Category.countDocuments();
        console.log(`[DEBUG] Total Categories in DB: ${count}`);
        const cats = await Category.find({}, 'name isActive order'); // Added order to see if it matters
        console.log('[DEBUG] Categories list:', JSON.stringify(cats, null, 2));
        process.exit(0);
    } catch (e) {
        console.error('[DEBUG] Error:', e);
        process.exit(1);
    }
};

run();
