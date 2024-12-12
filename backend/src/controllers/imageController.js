const Image = require('../models/Image');
const path = require('path');

// Handle image uploads
// Image upload controller (imageController.js)
exports.uploadImages = async (req, res) => {
    try {
        const { category } = req.body;
        const files = req.files;

        console.log('Received files:', files);  // Log received files
        console.log('Category:', category);  // Log received category

        if (!files || !category) {
            return res.status(400).json({ error: 'Please select files and provide a category.' });
        }

        const imageDocs = await Promise.all(files.map(async (file) => {
            const newImage = new Image({
                filename: file.originalname,
                filepath: file.path,  // Save the file path to the database
                category: category,
            });
            return newImage.save();
        }));

        res.json({ message: 'Images uploaded successfully!', images: imageDocs });
    } catch (err) {
        console.error('Error uploading images:', err);
        res.status(500).json({ error: 'Server error during image upload.' });
    }
};


// Fetch images by category
exports.getImagesByCategory = async (req, res) => {
    const { category } = req.params; // Category parameter from the URL
    try {
        const images = await Image.find({ category });
        res.json({ images });
    } catch (error) {
        console.error('Error fetching images by category:', error);
        res.status(500).json({ error: 'Server error while fetching images' });
    }
};
