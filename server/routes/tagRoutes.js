const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

router.get('/', async (req, res) => {
    try {
        const tags = await tagController.getAllTags();
        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
module.exports = router;