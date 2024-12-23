// ''
const express = require('express');
const router = express.Router();
const { uploadImages, getImagesByCategory, findSimilarImages, relevanceFeedback, getSimilarImagesByDescriptors} = require('../controllers/imageController'); // Ensure these controllers exist
const fs = require('fs'); // Import fs module
const path = require('path');
const upload = require('../middleware/uploadMiddleware'); // Ensure this is configured properly
const Image = require('../models/Image'); // Assuming your Image model is in 'models/Image'
// Route to handle image uploads
router.post('/upload', upload.array('images', 400), uploadImages); // 'images' is the field name that matches the formData key

// Route to fetch images by category
router.get('/:category', getImagesByCategory);

router.delete('/delete/:id', async (req, res) => {
    try {
        const imageId = req.params.id;

        // Find the image in the database
        const image = await Image.findById(imageId);
        if (!image) {
            return res.status(404).send('Image not found');
        }

        // Construct the file path and delete the image file
        const filePath = path.join(__dirname, '../../uploads', image.filepath.split('/').pop());

        // Delete the image file from the uploads folder
        fs.unlink(filePath, async (err) => {
            if (err) {
                console.error('Error deleting file:', err);
                return res.status(500).send('Error deleting image file');
            }

            console.log('File deleted successfully');

            // After successfully deleting the file, now delete the image from the database
            try {
                await Image.findByIdAndDelete(imageId);
                console.log('Image record deleted from database');
                res.status(200).send({ message: 'Image deleted successfully' });
            } catch (dbError) {
                console.error('Error deleting from database:', dbError);
                res.status(500).send('Error deleting image from database');
            }
        });
    } catch (error) {
        console.error('Error in delete route:', error);
        res.status(500).send('Server Error');
    }
});
router.get('/descriptors/:id', async (req, res) => {
    try {
        console.log('Fetching descriptors for ID:', req.params.id);
        const image = await Image.findById(req.params.id);

        if (!image) {
            console.log('Image not found:', req.params.id);
            return res.status(404).json({ message: 'Image not found' });
        }

        // Include all descriptor fields in the response
        const response = {
            filename: image.filename,         // Include filename
            filepath: image.filepath,
            histogram: image.histogram,
            dominantColors: image.dominantColors,
            textureDescriptors: image.textureDescriptors,
            huMoments: image.huMoments,
            textureImage: image.textureImage, // Add texture image path
            huImage: image.huImage,           // Add Hu moment image path
            edgeHistogram: image.edgeHistogram, // Add edge histogram
            glcmFeatures: image.glcmFeatures, // Add GLCM features
        };

        console.log('Descriptors found:', response);
        res.json(response);
    } catch (error) {
        console.error('Error fetching descriptors:', error.message);
        res.status(500).json({ message: 'Error fetching descriptors' });
    }
});

router.get('/similar/:id', findSimilarImages); // Route for finding similar images

router.post('/relevance-feedback', relevanceFeedback);

router.post('/similar', getSimilarImagesByDescriptors);

module.exports = router;