const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars (Assumes running from project root)
dotenv.config();

console.log('MONGO_URI:', process.env.MONGO_URI ? 'Found' : 'Missing');

if (!process.env.MONGO_URI) {
    console.error('ERROR: MONGO_URI environment variable not found.');
    process.exit(1);
}

const DB = process.env.MONGO_URI;

const migrate = async () => {
    try {
        await mongoose.connect(DB);
        console.log('DB Connection Successful');

        const db = mongoose.connection.db;

        // 1. Get All Categories
        const categories = await db.collection('categories').find({}).toArray();
        const categoryMap = {}; // Name -> ID

        categories.forEach(cat => {
            if (cat.name) {
                categoryMap[cat.name.toLowerCase()] = cat._id;
                // Also map the exact name just in case
                categoryMap[cat.name] = cat._id;
            }
        });

        console.log('Category Map built:', Object.keys(categoryMap).length, 'entries');

        // 2. Get All Services
        const services = await db.collection('services').find({}).toArray();
        console.log('Found', services.length, 'services');

        let updatedCount = 0;
        let errorCount = 0;

        for (const service of services) {
            const currentCat = service.category;

            // Check if it's a string (needs migration)
            if (typeof currentCat === 'string') {
                // 1. Try to find matching ID from Map (Name -> ID)
                let matchId = categoryMap[currentCat] || categoryMap[currentCat.toLowerCase()];

                // 2. If no name match, check if it's already a valid ObjectId string
                if (!matchId && mongoose.Types.ObjectId.isValid(currentCat)) {
                    matchId = new mongoose.Types.ObjectId(currentCat);
                    console.log(`Service "${service.title}" has valid ID string, converting to ObjectId: ${matchId}`);
                }

                if (matchId) {
                    await db.collection('services').updateOne(
                        { _id: service._id },
                        { $set: { category: matchId } }
                    );
                    console.log(`Updated Service "${service.title}": "${currentCat}" -> ${matchId}`);
                    updatedCount++;
                } else {
                    console.warn(`WARNING: Could not find Category ID for service "${service.title}" with category "${currentCat}"`);
                    errorCount++;
                    // Optional: Set to a default 'General' category if available, or leave as is (broken)
                }
            } else {
                // Already an object ID or null, skip
                // console.log(`Skipping Service "${service.title}" - Category is type ${typeof currentCat}`);
            }
        }

        console.log(`Migration Complete. Updated: ${updatedCount}, Errors: ${errorCount}`);
        process.exit();
    } catch (err) {
        console.error('Migration Failed:', err);
        process.exit(1);
    }
};

migrate();
