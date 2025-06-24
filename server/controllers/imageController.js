// controllers/imageController.js
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

// Make sure client/public/images exists
const clientImagesDir = path.join(__dirname, '../../client/public/images');
if (!fs.existsSync(clientImagesDir)) {
  fs.mkdirSync(clientImagesDir, { recursive: true });
}

// --- Multer Setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, clientImagesDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `recipe-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// --- Business Logic (no req/res here) ---
function getPublicImageUrl(filename) {
  return `/images/${filename}`;
}

module.exports = {
  upload,
  getPublicImageUrl
};
