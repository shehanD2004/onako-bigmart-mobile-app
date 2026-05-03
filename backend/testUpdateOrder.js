const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Order = require('./models/Order');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const order = await Order.findOne({ orderStatus: "processing" });
        if(!order) {
            console.log("No processing order found");
            process.exit(0);
        }
        
        console.log("Found order:", order._id);
        order.orderStatus = "out_for_delivery";
        order.statusHistory.push({ status: "out_for_delivery", note: "Test", updatedBy: "60b9b0b9b0b9b0b9b0b9b0b9" }); 
        await order.save();
        console.log("Save successful!");
        process.exit(0);
    } catch (e) {
        console.error("Save failed with error:", e);
        process.exit(1);
    }
}
run();
