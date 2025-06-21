const express = require('express');
const router = express.Router();
const controller = require('../controllers/articlesController');

router.get('/',controller.getAllArticles);
router.get('/:id',controller.getArticleById);
router.post('/',controller.postArticle)
router.delete('/:id',async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to delet article" });
  }
controller.deleteArticle(req,res);
})
router.put('/:id',async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to update article" });
  }
controller.putArticle(req,res);
})
module.exports = router;