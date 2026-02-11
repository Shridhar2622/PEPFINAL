const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');

// Cloudinary Storage Configuration
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'reservice/technicians', // Folder in Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
        resource_type: 'auto', // Auto-detect (image/raw/video)
        public_id: (req, file) => `technician-${req.user?.id || 'guest'}-${Date.now()}` // Custom public_id
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
