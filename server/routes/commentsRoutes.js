const express = require('express');
const router = express.Router();
const controller = require('../controllers/commentsController');

router.get('/recipecomments/:id', controller.getRecipeComments);
router.get('/articlecomments/:id', controller.getArticleComments);
router.post('/recipecomments',async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to comment" });
  }
controller.postRecipeComments(req,res);
});
module.exports = router;
router.post('/articlecomments',async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to comment" });
  }
controller.postArticleComments(req,res);
});
router.delete('/recipecomments/:id',async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to delet comment" });
  }
controller.deleteRecipeComment(req,res);
})
router.delete('/articlecomments/:id',async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to delet comment" });
  }
controller.deleteArticleComment(req,res);
})
module.exports = router;
