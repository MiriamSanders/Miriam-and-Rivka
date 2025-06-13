const express = require('express');
const router = express.Router();
const controller = require('../controllers/articlesController');

router.get('/articles',controller.getAllArticles);
router.get('/articles/:id',controller.getArticleById);
router.post('/articles',controller.postArticle)

module.exports = router;