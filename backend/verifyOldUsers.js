const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
if (!process.env.MONGO_URI) require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    console.log("Connected to MongoDB Database");
    const result = await User.updateMany(
        { },
        { $set: { isVerified: true } }
    );
    console.log("Updated", result.modifiedCount, "users to isVerified = true");
    process.exit(0);
})
.catch(err => {
    console.error("Connection error", err);
    process.exit(1);
});
