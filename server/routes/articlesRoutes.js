const express = require('express');
const router = express.Router();
const Controller = require('../controllers/articlesController');

router.get('/articles',Controller.getAllArticles);
router.get('/articles/:id',Controller.getArticleById);

module.exports = router;