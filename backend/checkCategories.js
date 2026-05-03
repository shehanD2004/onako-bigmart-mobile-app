const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const Category = require("./models/Category");

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const categories = await Category.find();
    console.log("Categories in DB:");
    categories.forEach((c) => console.log(`- ${c.name} (${c.type})`));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
check();
