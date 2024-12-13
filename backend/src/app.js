// ''
const express = require('express');
const cors = require('cors');
const path = require('path');  // Add this line
const app = express();
const connectDB = require('./config/db'); // Ensure the database connection is set up correctly

const imageRoutes = require('./routes/images');

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',  // Allow requests from your frontend
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}));
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Use the routes for image-related requests
app.use('/api/images', imageRoutes);

// Connect to MongoDB
connectDB();

module.exports = app;
