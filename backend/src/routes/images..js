const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadImages } = require('../controllers/imageController');

router.post('/upload', upload.array('images', 10), uploadImages);

module.exports = router;
