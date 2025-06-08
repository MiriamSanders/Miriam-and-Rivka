const express = require('express');
const router = express.Router();
const Controller = require('../controllers/commentsController');

router.get('/recipecomments/:id', Controller.getRecipeComments);
router.get('/articlecomments/:id', Controller.getArticleComments);
router.post('/recipecomments',async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to comment" });
  }
Controller.postRecipeComments(req,res);
});
module.exports = router;
router.post('/articlecomments',async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to comment" });
  }
Controller.postArticleComments(req,res);
});
module.exports = router;
