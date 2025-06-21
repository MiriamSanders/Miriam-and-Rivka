const express = require('express');
const router = express.Router();
const controller = require('../controllers/ratingController');
router.get('/:recipeId', controller.getRatings);
router.post('/',async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to rate" });
  }
controller.postRatings(req,res);
});
module.exports = router;