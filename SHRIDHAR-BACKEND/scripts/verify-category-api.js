const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });
const DB = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;
const API_URL = `http://localhost:${PORT}/api/v1/categories`;

const runVerification = async () => {
    try {
        console.log('--- DB & API Verification ---');

        // 1. Connect to DB to check raw data
        await mongoose.connect(DB);
        console.log('✅ DB Connected');

        // 2. Create Test Category via DB directly (to bypass any Controller/API upload logic for now)
        const testCategoryName = `Script Test ${Date.now()}`;
        const newCat = await mongoose.connection.db.collection('categories').insertOne({
            name: testCategoryName,
            slug: testCategoryName.toLowerCase().replace(/ /g, '-'),
            isActive: true, // Ensuring active
            description: 'Created by verification script',
            image: 'default-category.jpg',
            createdAt: new Date(),
            updatedAt: new Date(),
            __v: 0
        });

        console.log(`✅ Created Category via DB: "${testCategoryName}" (ID: ${newCat.insertedId})`);

        // 3. Check if it exists in DB
        const dbCat = await mongoose.connection.db.collection('categories').findOne({ _id: newCat.insertedId });
        if (dbCat) {
            console.log(`✅ Confirmed in DB: Found "${dbCat.name}" (Active: ${dbCat.isActive})`);
        } else {
            console.error('❌ Failed to find in DB immediately after insertion!');
        }

        // 4. Check API endpoint (Simulate frontend fetch)
        console.log(`\n⏳ Fetching from API: ${API_URL}`);
        try {
            const res = await axios.get(API_URL);

            if (res.data.status === 'success') {
                const apiCats = res.data.data.categories;
                console.log(`✅ API Returned ${apiCats.length} categories.`);

                const foundInApi = apiCats.find(c => c._id === newCat.insertedId.toString() || c.name === testCategoryName);

                if (foundInApi) {
                    console.log(`✅ SUCCESS: Category "${foundInApi.name}" is present in API response.`);
                    console.log(`   Status in API: ${foundInApi.isActive}`);
                } else {
                    console.error(`❌ FAILURE: Category "${testCategoryName}" is NOT in API response.`);
                    console.log('   Dumping API Category Names:', apiCats.map(c => c.name));
                }
            } else {
                console.error('❌ API Error: Response status not success', res.data);
            }

        } catch (apiErr) {
            console.error('❌ API Request Failed:', apiErr.message);
            if (apiErr.response) {
                console.error('   Status:', apiErr.response.status);
                console.error('   Data:', apiErr.response.data);
            } else if (apiErr.code === 'ECONNREFUSED') {
                console.error('   Server is not running or port is wrong.');
            }
        }

        // Cleanup
        await mongoose.connection.db.collection('categories').deleteOne({ _id: newCat.insertedId });
        console.log('\n🧹 Cleaned up test category.');
        process.exit();

    } catch (err) {
        console.error('❌ Script Error:', err);
        process.exit(1);
    }
};

runVerification();
