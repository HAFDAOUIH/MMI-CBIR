// backend/src/app.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const imageRoutes = require('./routes/images');
app.use('/api/images', imageRoutes);

module.exports = app;
