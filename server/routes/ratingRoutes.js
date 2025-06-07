const express = require('express');
const router = express.Router();
const Controller = require('../controllers/ratingController');
<<<<<<< HEAD
router.post('/ratings',async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to rate" });
  }
Controller.postRatings();
});
=======
router.post('/ratings',Controller.postRatings);
router.get('/ratings/:recipeId', Controller.getRatings);
module.exports = router;
>>>>>>> 690d23bd7408d7c88deed240b729b7ebe9c007ed
