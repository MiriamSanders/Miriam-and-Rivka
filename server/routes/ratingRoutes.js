const express = require('express');
const router = express.Router();
const Controller = require('../controllers/ratingController');
router.post('/ratings',Controller.postRatings);
router.get('/ratings/:recipeId', Controller.getRatings);
module.exports = router;