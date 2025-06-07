const express = require('express');
const router = express.Router();
const Controller = require('../controllers/ratingController');
router.get('/ratings/:recipeId', Controller.getRatings);
router.post('/ratings',async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to rate" });
  }
Controller.postRatings(req,res);
});
module.exports = router;