const express = require('express');
const router = express.Router();
const Controller = require('../controllers/ratingController');
router.post('/ratings',Controller.postRatings);