const mongoose = require("mongoose");

const DEFAULT_URI = "mongodb://127.0.0.1:27017/shopping_list_hw";

async function connect(uri = process.env.MONGODB_URI || DEFAULT_URI) {
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        return mongoose;
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        throw err;
    }
}

async function disconnect() {
    await mongoose.disconnect();
}

module.exports = { mongoose, connect, disconnect };
