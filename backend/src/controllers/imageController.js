const Image = require('../models/Image');
const axios = require('axios');

// Function to calculate descriptors via the Flask API
const calculateDescriptors = async (imagePath) => {
    try {
        console.log('Sending request to Flask API for descriptors:', imagePath);
        const response = await axios.post('http://localhost:5001/api/calculate_descriptors', {
            image_path: imagePath,
        });
        console.log('Response from Flask API:', response.data);
        return response.data; // Return the descriptors
    } catch (error) {
        console.error('Error communicating with Flask API:', error.message);
        return {
            histogram: [],
            dominantColors: [],
            textureDescriptors: [],
            huMoments: [],
        };
    }
};

// Unified function to handle single or multiple image uploads
exports.uploadImages = async (req, res) => {
    try {
        const { category } = req.body; // Category from request body
        const files = req.files; // Uploaded files array

        if (!files || !category) {
            return res.status(400).json({ error: 'Please select files and provide a category.' });
        }

        console.log('Received files:', files);
        console.log('Category:', category);

        // Process each file, calculate descriptors, and save to MongoDB
        const imageDocs = await Promise.all(
            files.map(async (file) => {
                // Calculate descriptors
                const descriptors = await calculateDescriptors(file.path);

                // Save image document in MongoDB
                const newImage = new Image({
                    filename: file.originalname,
                    filepath: file.path,
                    category: category,
                    histogram: descriptors.histogram,
                    dominantColors: descriptors.dominant_colors,
                    textureDescriptors: descriptors.textureDescriptors,
                    huMoments: descriptors.huMoments,
                });
                return newImage.save();
            })
        );

        res.status(201).json({ message: 'Images uploaded successfully!', images: imageDocs });
    } catch (error) {
        console.error('Error uploading images:', error.message);
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
        console.error('Error fetching images by category:', error.message);
        res.status(500).json({ error: 'Server error while fetching images' });
    }
};
