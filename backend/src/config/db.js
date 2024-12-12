// backend/src/config/db.js
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/imageDB';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log(`MongoDB connected`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: `, error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
