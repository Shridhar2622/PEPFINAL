const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const deleteFromCloudinary = async (imageUrl) => {
    if (!imageUrl || !imageUrl.includes('cloudinary')) return;

    try {
        // Extract public ID from URL
        // Example: https://res.cloudinary.com/demo/image/upload/v1614066723/services/sample_image.jpg
        // Public ID: services/sample_image
        const splitUrl = imageUrl.split('/');
        const filename = splitUrl[splitUrl.length - 1]; // sample_image.jpg
        const folder = splitUrl[splitUrl.length - 2];   // services
        const publicId = `${folder}/${filename.split('.')[0]}`;

        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted image from Cloudinary: ${publicId}`);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
    }
};

module.exports = deleteFromCloudinary;
