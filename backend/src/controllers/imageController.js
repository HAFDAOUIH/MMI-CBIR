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

const calculateEuclideanDistance = (a, b) => {
    if (!a || !b || a.length !== b.length) return Infinity;
    return Math.sqrt(a.reduce((sum, value, i) => sum + Math.pow(value - b[i], 2), 0));
};

// Function to calculate combined similarity using weighted distances
const calculateCombinedSimilarity = (queryImage, otherImage) => {
    let totalDistance = 0;

    // Assign weights to each descriptor
    const weights = {
        dominantColors: 0.4, // 40% weight
        histogram: 0.3,      // 30% weight
        textureDescriptors: 0.2, // 20% weight
        huMoments: 0.1       // 10% weight
    };

    // Calculate distances for each descriptor
    const colorDistance = calculateEuclideanDistance(
        queryImage.dominantColors.flat(),
        otherImage.dominantColors.flat()
    );

    const histogramDistance = calculateEuclideanDistance(
        queryImage.histogram?.blue_channel || [],
        otherImage.histogram?.blue_channel || []
    );

    const textureDistance = calculateEuclideanDistance(
        queryImage.textureDescriptors || [],
        otherImage.textureDescriptors || []
    );

    const huDistance = calculateEuclideanDistance(
        queryImage.huMoments || [],
        otherImage.huMoments || []
    );

    // Combine distances using weights
    totalDistance += weights.dominantColors * colorDistance;
    totalDistance += weights.histogram * histogramDistance;
    totalDistance += weights.textureDescriptors * textureDistance;
    totalDistance += weights.huMoments * huDistance;

    return totalDistance;
};

// Function to precompute similar images
const precomputeSimilarImages = async (newImage) => {
    try {
        console.log('Precomputing similar images...');
        const cursor = Image.find({ _id: { $ne: newImage._id } }) // Exclude the new image
            .select('dominantColors textureDescriptors category') // Fetch only required fields
            .lean() // Return plain JavaScript objects, not Mongoose documents
            .cursor();

        const similarImages = [];

        for (let image = await cursor.next(); image != null; image = await cursor.next()) {
            const colorDistance = calculateEuclideanDistance(
                newImage.dominantColors.flat(),
                image.dominantColors.flat()
            );

            const textureDistance = calculateEuclideanDistance(
                newImage.textureDescriptors.slice(0, 1000), // Use first 1000 items for speed
                image.textureDescriptors.slice(0, 1000)
            );

            // Weighted combined similarity
            const combinedDistance = colorDistance * 0.6 + textureDistance * 0.4;

            similarImages.push({
                id: image._id,
                distance: combinedDistance,
                category: image.category,
            });
        }

        // Sort and take the top 20 images
        const top20Images = similarImages
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5)
            .map((img) => img.id);

        // Save the precomputed similar images in the new image document
        newImage.similarImages = top20Images;
        await newImage.save();
        console.log('Precomputed similar images saved successfully!');
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

exports.relevanceFeedback = async (req, res) => {
    try {
        const { queryDescriptors, relevantImages, nonRelevantImages } = req.body;
        const response = await axios.post('http://localhost:5001/api/relevance_feedback', {
            query_descriptors: queryDescriptors,
            relevant_images: relevantImages,
            non_relevant_images: nonRelevantImages,
            alpha: 1.0,
            beta: 0.5,
        });
        res.json({ newQueryDescriptors: response.data.new_query_descriptors });
    } catch (error) {
        console.error('Error during relevance feedback:', error.message);
        res.status(500).json({ error: 'Relevance feedback failed' });
    }
};


exports.getSimilarImagesByDescriptors = async (req, res) => {
    try {
        const { queryDescriptors } = req.body;

        if (!queryDescriptors || queryDescriptors.length === 0) {
            return res.status(400).json({ error: 'Query descriptors are required' });
        }

        // Retrieve all images and compute their similarity with the queryDescriptors
        const allImages = await Image.find(); // Assuming `Image` is your model
        const similarImages = allImages
            .map((image) => ({
                image,
                similarity: computeSimilarity(image.textureDescriptors, queryDescriptors),
            }))
            .sort((a, b) => b.similarity - a.similarity) // Sort by similarity in descending order
            .slice(0, 10) // Return the top 10 similar images
            .map((entry) => entry.image);

        res.json({ similarImages });
    } catch (error) {
        console.error('Error fetching similar images:', error.message);
        res.status(500).json({ error: 'Failed to fetch similar images' });
    }
};

// Utility function to compute similarity
const computeSimilarity = (descriptors1, descriptors2) => {
    if (!descriptors1 || !descriptors2 || descriptors1.length !== descriptors2.length) {
        return 0;
    }

    // Example: Euclidean Distance (you can replace with other similarity measures)
    const distance = Math.sqrt(
        descriptors1.reduce((sum, value, index) => sum + Math.pow(value - descriptors2[index], 2), 0)
    );
    return 1 / (1 + distance); // Higher value means more similarity
};
