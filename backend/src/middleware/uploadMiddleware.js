const multer = require('multer');
const path = require('path');

// Define storage for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Save uploads in a folder named "uploads" inside backend
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        // Keep original name or generate a unique name
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

module.exports = upload;
