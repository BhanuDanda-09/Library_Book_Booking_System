const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary (reads from env vars)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage engine for book covers
const bookCoverStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'library_lms/books',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 560, crop: 'fill', quality: 'auto' }],
  },
});

// Storage engine for profile pictures
const profilePicStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'library_lms/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 200, height: 200, crop: 'fill', quality: 'auto' }],
  },
});

const uploadBookCover  = multer({ storage: bookCoverStorage,  limits: { fileSize: 5 * 1024 * 1024 } });
const uploadProfilePic = multer({ storage: profilePicStorage, limits: { fileSize: 2 * 1024 * 1024 } });

module.exports = { cloudinary, uploadBookCover, uploadProfilePic };
