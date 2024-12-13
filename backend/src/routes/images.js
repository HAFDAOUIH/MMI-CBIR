// ''
const express = require('express');
const router = express.Router();
const { uploadImages, getImagesByCategory} = require('../controllers/imageController'); // Ensure these controllers exist
const upload = require('../middleware/uploadMiddleware'); // Ensure this is configured properly

// Route to handle image uploads
router.post('/upload', upload.array('images', 400), uploadImages); // 'images' is the field name that matches the formData key

// Route to fetch images by category
router.get('/:category', getImagesByCategory);


module.exports = router;