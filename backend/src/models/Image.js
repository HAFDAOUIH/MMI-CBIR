const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    filepath: { type: String, required: true },
    category: { type: String, required: true },
    transformations: [
        {
            type: { type: String },
            params: { type: Object }
        }
    ],
}, { timestamps: true });

module.exports = mongoose.model('Image', imageSchema);
