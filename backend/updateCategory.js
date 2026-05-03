const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Category = require('./models/Category');

const update = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await Category.updateOne({ name: 'Dairy & Eggs' }, { $set: { type: 'category' } });
        console.log("Update result:", result);
        
        // Also let's output all categories to confirm
        const categories = await Category.find();
        console.log("\nCategories in DB after update:");
        categories.forEach(c => console.log(`- ${c.name} (${c.type})`));
        
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
};
update();
