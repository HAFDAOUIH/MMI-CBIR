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

// Function to calculate Euclidean distance
const calculateEuclideanDistance = (a, b) => {
    if (a.length !== b.length) return Infinity;
    return Math.sqrt(a.reduce((sum, value, i) => sum + Math.pow(value - b[i], 2), 0));
};

// Function to precompute similar images
const precomputeSimilarImages = async (newImage) => {
    try {
        const allImages = await Image.find({ _id: { $ne: newImage._id } }).select('dominantColors');

        const similarImages = allImages
            .map((image) => {
                const distance = calculateEuclideanDistance(
                    newImage.dominantColors.flat(),
                    image.dominantColors.flat()
                );
                return { id: image._id, distance };
            })
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5);

        newImage.similarImages = similarImages.map((img) => img.id); // Save similar image IDs
        await newImage.save();
    } catch (error) {
        console.error('Error precomputing similar images:', error.message);
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
                // Step 1: Calculate descriptors
                const descriptors = await calculateDescriptorsAsync(file.path);

                // Step 2: Save the image to the database
                const newImage = new Image({
                    filename: file.originalname,
                    filepath: file.path,
                    category: category,
                    histogram: descriptors.histograms,
                    dominantColors: descriptors.dominantColors,
                    textureDescriptors: descriptors.textureDescriptors,
                    huMoments: descriptors.huMoments,
                    textureImage: descriptors.textureImage,
                    huImage: descriptors.huImage,
                    glcmFeatures: descriptors.glcmFeatures,
                    edgeHistogram: descriptors.edgeHistogram,
                });

                await newImage.save();

                // Step 3: Precompute similar images
                await precomputeSimilarImages(newImage);

                return newImage;
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
    const { category } = req.params;
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
            filename: image.filename,
            filepath: image.filepath,
            histogram: image.histogram,
            dominantColors: image.dominantColors,
            textureDescriptors: image.textureDescriptors,
            huMoments: image.huMoments,
            textureImage: image.textureImage,
            huImage: image.huImage,
            edgeHistogram: image.edgeHistogram,
            glcmFeatures: image.glcmFeatures,
        });
    } catch (error) {
        console.error('Error fetching image descriptors:', error.message);
        res.status(500).json({ message: 'Error fetching image descriptors' });
    }
};

// Fetch similar images
exports.findSimilarImages = async (req, res) => {
    try {
        const { id } = req.params;

        const queryImage = await Image.findById(id).populate('similarImages');
        if (!queryImage) {
            return res.status(404).json({ message: 'Query image not found' });
        }

        res.json({ similarImages: queryImage.similarImages });
    } catch (error) {
        console.error('Error finding similar images:', error.message);
        res.status(500).json({ message: 'Server error while finding similar images' });
    }
};
