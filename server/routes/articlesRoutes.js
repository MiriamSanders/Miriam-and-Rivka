const express = require('express');
const router = express.Router();
const controller = require('../controllers/articlesController');

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 0;
    const articles = await controller.getAllArticles(limit, page);
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'something went wrong' });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    const article = await controller.getArticleById(articleId);
    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'something went wrong' });
  }
});
router.post('/', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to post article" });
  }
  try {
    const data = req.body;
    const articleResult = await controller.postArticle(data);
    res.status(201).json(articleResult);
  } catch (error) {
    console.error('Error posting article:', error);
    res.status(500).json({ error: 'internal server error' });
  }
})
router.delete('/:id', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to delete article" });
  }
  try {
    const articleId = parseInt(req.params.id);
    const result = await controller.deleteArticle(articleId);
    res.json(result);
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'something went wrong' });
  }
})
router.put('/:id', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to update article" });
  }
  try {
    const articleId = parseInt(req.params.id);
    const { title, content } = req.body;
    const result = await controller.putArticle(articleId, title, content);
    res.json(result);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'something went wrong' });
  }
})
module.exports = router;