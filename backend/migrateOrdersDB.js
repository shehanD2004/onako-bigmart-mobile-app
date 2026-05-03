const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const Order = require("./models/Order");

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const collection = db.collection("orders");

    const orders = await collection.find({}).toArray();
    let migratedCount = 0;

    for (let doc of orders) {
      let changed = false;

      if (doc.items && Array.isArray(doc.items)) {
        for (let item of doc.items) {
          if (item.unitPrice !== undefined) {
            item.pricePerUnit = item.unitPrice;
            delete item.unitPrice;
            changed = true;
          }
        }
      }

      if (changed) {
        await collection.updateOne(
          { _id: doc._id },
          { $set: { items: doc.items } },
        );
        migratedCount++;
      }
    }

    console.log(`Migration successful. Migrated ${migratedCount} orders.`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
run();
