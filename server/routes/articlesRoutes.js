const express = require('express');
const router = express.Router();
const controller = require('../controllers/articlesController');

router.get('/articles',controller.getAllArticles);
router.get('/articles/:id',controller.getArticleById);
router.post('/articles',controller.postArticle)
router.delete('/articles/:id',async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to delet article" });
  }
controller.deleteArticle(req,res);
})
router.put('/articles/:id',async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to update article" });
  }
controller.putArticle(req,res);
})
module.exports = router;