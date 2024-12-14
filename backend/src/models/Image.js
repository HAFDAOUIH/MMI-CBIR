const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    filepath: { type: String, required: true },
    category: { type: String, required: true },
    histogram: {
        blue: [Number],
        green: [Number],
        red: [Number],
    }, // Separate histograms for RGB
    dominantColors: [[Number]],
    textureDescriptors: [Number],
    huMoments: [Number],
}, { timestamps: true });

module.exports = mongoose.model('Image', imageSchema);