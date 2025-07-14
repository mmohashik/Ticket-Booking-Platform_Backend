const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory for e-commerce if it doesn't exist
const ecomUploadDir = path.join(__dirname, '../../public/uploads/ecom');
if (!fs.existsSync(ecomUploadDir)) {
  fs.mkdirSync(ecomUploadDir, { recursive: true });
}

// Storage configuration for e-commerce images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, ecomUploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

// Multer configuration
const ecomUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = ecomUpload;
