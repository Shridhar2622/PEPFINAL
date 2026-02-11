const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shridhar-backend';

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        const db = mongoose.connection.db;

        // 1. Update User Roles
        console.log('Updating User roles (WORKER -> TECHNICIAN)...');
        const userUpdateResult = await db.collection('users').updateMany(
            { role: 'WORKER' },
            { $set: { role: 'TECHNICIAN' } }
        );
        console.log(`Updated ${userUpdateResult.modifiedCount} users.`);

        // 2. Rename Collection 'workerprofiles' -> 'technicianprofiles'
        const collections = await db.listCollections().toArray();
        const workerProfileExists = collections.some(c => c.name === 'workerprofiles');
        const technicianProfileExists = collections.some(c => c.name === 'technicianprofiles');

        if (workerProfileExists) {
            if (technicianProfileExists) {
                console.log('Both collections exist. Merging or skipping rename. (Assuming technicianprofiles is clearer)');
                // Ideally merge, but for now log warning.
            } else {
                console.log('Renaming collection workerprofiles -> technicianprofiles...');
                await db.collection('workerprofiles').rename('technicianprofiles');
                console.log('Collection renamed.');
            }
        } else {
            console.log('Collection workerprofiles does not exist. Skipping rename.');
        }

        // 3. Update Fields in Collections
        const collectionsToUpdate = [
            'bookings',
            'reviews',
            'services',
            'transactions'
        ];

        for (const colName of collectionsToUpdate) {
            console.log(`Updating field 'worker' -> 'technician' in ${colName}...`);
            // Check if collection exists first
            if (collections.some(c => c.name === colName)) {
                const result = await db.collection(colName).updateMany(
                    { worker: { $exists: true } },
                    { $rename: { 'worker': 'technician' } }
                );
                console.log(`Updated ${result.modifiedCount} documents in ${colName}.`);
            } else {
                console.log(`Collection ${colName} not found.`);
            }
        }

        console.log('Migration Completed Successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration Failed:', error);
        process.exit(1);
    }
}

migrate();
