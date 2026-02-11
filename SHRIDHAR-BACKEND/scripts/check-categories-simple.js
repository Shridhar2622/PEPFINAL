const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
const DB = process.env.MONGO_URI;

mongoose.connect(DB).then(async () => {
    console.log("CONNECTED");
    const cats = await mongoose.connection.db.collection('categories').find({}).toArray();
    console.log("COUNT:", cats.length);
    cats.forEach(c => console.log(JSON.stringify(c)));
    process.exit();
}).catch(e => {
    console.error(e);
    process.exit(1);
});
