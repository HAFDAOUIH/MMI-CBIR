const multer = require('multer');
const path = require('path');

// Configure storage settings for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure the 'uploads' folder exists and is writable
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        // Use a unique name for the file
        cb(null, Date.now() + '-' + file.originalname);
    },
});

// Limit file size to 10MB
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024,files: 400, } });

module.exports = upload;
