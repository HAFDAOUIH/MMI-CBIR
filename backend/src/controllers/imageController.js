const Image = require('../models/Image');
const path = require('path');

exports.uploadImages = async (req, res) => {
    try {
        const { category } = req.body;
        const files = req.files; // array of uploaded images

        if (!files || !category) {
            return res.status(400).json({ error: 'Category and files are required.' });
        }

        const imageDocs = await Promise.all(files.map(async (file) => {
            const newImage = new Image({
                filename: file.originalname,
                filepath: file.path,
                category: category
            });
            return newImage.save();
        }));

        res.json({ message: 'Images uploaded successfully', images: imageDocs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
