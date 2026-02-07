const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const DB = process.env.MONGO_URI;

const checkCategories = async () => {
    try {
        await mongoose.connect(DB);
        console.log('DB Connection Successful');

        const categories = await mongoose.connection.db.collection('categories').find({}).toArray();

        console.log('\n--- ALL CATEGORIES ---');
        categories.forEach(c => {
            console.log(`ID: ${c._id} | Name: "${c.name}" | Active: ${c.isActive} | Slug: ${c.slug}`);
        });
        console.log('----------------------\n');

        const services = await mongoose.connection.db.collection('services').find({}).toArray();
        console.log('--- SERVICES WITH CATEGORY MAPPING ---');
        services.slice(0, 5).forEach(s => {
            console.log(`Service: "${s.title}" | Category: ${s.category} (Type: ${typeof s.category})`);
        });

        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkCategories();
