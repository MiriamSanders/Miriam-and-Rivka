const express = require('express');
const router = express.Router();
const controller = require('../controllers/ratingController');
router.get('/:recipeId', async (req, res) => {
  try {
    const recipeId = parseInt(req.params.recipeId);
    const ratings = await controller.getRatings(recipeId);
    res.json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'something went wrong' });
  }
});
router.post('/', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to rate" });
  }
  try {
    const { userId, recipeId, rating } = req.body;
    const result = await controller.postRatings(userId, recipeId, rating);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error posting rating:', error);
    res.status(500).json({ error: 'something went wrong' });
  }
});
module.exports = router;