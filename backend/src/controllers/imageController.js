const Image = require('../models/Image');
const axios = require('axios');

// Function to calculate descriptors via the Flask API
const calculateDescriptorsAsync = async (imagePath) => {
    try {
        console.log(`Sending imagePath to Flask: ${imagePath}`);
        const response = await axios.post('http://localhost:5001/api/calculate_descriptors', {
            image_path: imagePath,
        });
        console.log('Descriptors received:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error communicating with Flask API:', error.message);
        return {
            histograms: { blue_channel: [], green_channel: [], red_channel: [] },
            dominantColors: [],
            textureDescriptors: [],
            huMoments: [],
            glcmFeatures: {}, // Add default empty object
            edgeHistogram: [],
        };
    }
};


// Unified function to handle image uploads
exports.uploadImages = async (req, res) => {
    try {
        const { category } = req.body;
        const files = req.files;

        if (!files || !category) {
            return res.status(400).json({ error: 'Please select files and provide a category.' });
        }

        const imageDocs = await Promise.all(
            files.map(async (file) => {
                const descriptors = await calculateDescriptorsAsync(file.path);

                const newImage = new Image({
                    filename: file.originalname,
                    filepath: file.path,
                    category: category,
                    histogram: descriptors.histograms,
                    dominantColors: descriptors.dominantColors,
                    textureDescriptors: descriptors.textureDescriptors,
                    huMoments: descriptors.huMoments,
                    textureImage: descriptors.textureImage, // Ensure this is saved
                    huImage: descriptors.huImage,
                    glcmFeatures: descriptors.glcmFeatures, // Add this
                    edgeHistogram: descriptors.edgeHistogram, // Add this
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
            filename: image.filename,        // Add this
            filepath: image.filepath,
            histogram: image.histogram,
            dominantColors: image.dominantColors,
            textureDescriptors: image.textureDescriptors,
            huMoments: image.huMoments,
            textureImage: image.textureImage, // Include texture image path
            huImage: image.huImage,           // Include Hu moment image path
            edgeHistogram: image.edgeHistogram, // Include edge histogram
            glcmFeatures: image.glcmFeatures, // Include GLCM features
        });
    } catch (error) {
        console.error('Error fetching image descriptors:', error.message);
        res.status(500).json({ message: 'Error fetching image descriptors' });
    }
};
