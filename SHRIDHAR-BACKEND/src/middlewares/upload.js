const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');

// Ensure upload directory exists
const uploadDir = 'public/uploads/technicians';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Naming: technician-{userId}-{timestamp}.ext
        const ext = file.mimetype.split('/')[1];
        cb(null, `technician-${req.user.id}-${Date.now()}.${ext}`);
    }
});

// File Filter (Images Only)
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new AppError('Invalid file type! Please upload only images or PDF.', 400), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: multerFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = upload;
