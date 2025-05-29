const express = require('express');
const router = express.Router();
const Controller = require('../controllers/articlesController');

router.get('/articles',Controller.getAllArticles);

module.exports = router;