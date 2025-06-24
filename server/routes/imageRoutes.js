const express = require('express');
const router = express.Router();
const { upload, getPublicImageUrl } = require('../controllers/imageController');

router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = getPublicImageUrl(req.file.filename);
    res.status(200).json({ url: imageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
