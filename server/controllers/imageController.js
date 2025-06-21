const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Point to the client/public/images folder
const clientImagesDir = path.join(__dirname, '../../client/public/images');
console.log(clientImagesDir);
if (!fs.existsSync(clientImagesDir)) {
  fs.mkdirSync(clientImagesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, clientImagesDir); // Save in React's public/images folder
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
  limits: { fileSize: 5 * 1024 * 1024 } 
});

const uploadImage = (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  // Return public path (what the browser will use to access it)
  const publicUrl = `/images/${req.file.filename}`;
  res.json({ url: publicUrl });
};

module.exports = {
  upload,
  uploadImage
};