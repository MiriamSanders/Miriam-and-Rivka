const express = require('express');
const router = express.Router();
const Controller = require('../controllers/commentsController');

router.get('/comments/:id', Controller.getRecipeComments);
module.exports = router;