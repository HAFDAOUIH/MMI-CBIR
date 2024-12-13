const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    filepath: { type: String, required: true },
    category: { type: String, required: true },
    histogram: [Number], // Color histogram (array of numbers)
    dominantColors: [[Number]], // Array of RGB values for dominant colors
    textureDescriptors: [Number], // Array of Gabor texture descriptors
    huMoments: [Number], // Array of Hu moments
}, { timestamps: true });

module.exports = mongoose.model('Image', imageSchema);
