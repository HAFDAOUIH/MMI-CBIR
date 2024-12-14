const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    filepath: { type: String, required: true },
    category: { type: String, required: true },
    histogram: {
        blue: [Number],
        green: [Number],
        red: [Number],
    },
    dominantColors: [[Number]],
    textureDescriptors: [Number],
    huMoments: [Number],
    textureImage: { type: String }, // Add this
    huImage: { type: String },      // Add this
    glcmFeatures: {
        contrast: [Number],
        dissimilarity: [Number],
        homogeneity: [Number],
        energy: [Number],
        correlation: [Number],
    },
    edgeHistogram: [Number],
}, { timestamps: true });

module.exports = mongoose.model('Image', imageSchema);
