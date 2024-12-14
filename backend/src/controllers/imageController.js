const Image = require('../models/Image');
const axios = require('axios');

// Function to calculate descriptors via the Flask API
const calculateDescriptorsAsync = async (imagePath) => {
    try {
        console.log('Sending request to Flask API for descriptors:', imagePath);
        const response = await axios.post('http://localhost:5001/api/calculate_descriptors', {
            image_path: imagePath,
        });
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

// Unified function to handle image uploads
exports.uploadImages = async (req, res) => {
    try {
        const { category } = req.body; // Category from request body
        const files = req.files; // Uploaded files array

        if (!files || !category) {
            return res.status(400).json({ error: 'Please select files and provide a category.' });
        }

        console.log('Received files:', files);
        console.log('Category:', category);

        // Process each file, calculate descriptors asynchronously
        const imageDocs = await Promise.all(
            files.map(async (file) => {
                // Asynchronously calculate descriptors
                const descriptors = await calculateDescriptorsAsync(file.path);

                // Save image document in MongoDB
                const newImage = new Image({
                    filename: file.originalname,
                    filepath: file.path,
                    category: category,
                    histogram: descriptors.histogram,
                    dominantColors: descriptors.dominantColors,
                    textureDescriptors: descriptors.textureDescriptors,
                    huMoments: descriptors.huMoments,
                });

                return newImage.save();
            })
        );

        res.status(201).json({ message: 'Images uploaded and descriptors calculated successfully!', images: imageDocs });
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

// Fetch descriptors for an image by its ID
exports.getImageDescriptors = async (req, res) => {
    const { id } = req.params;
    try {
        const image = await Image.findById(id);
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }
        res.json({
            histogram: image.histogram,
            dominantColors: image.dominantColors,
            textureDescriptors: image.textureDescriptors,
            huMoments: image.huMoments,
        });
    } catch (error) {
        console.error('Error fetching image descriptors:', error.message);
        res.status(500).json({ error: 'Server error while fetching image descriptors' });
    }
};
