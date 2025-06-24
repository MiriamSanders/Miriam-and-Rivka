const express = require('express');
const router = express.Router();
const controller = require('../controllers/commentsController');

router.get('/', async (req, res) => {
  try {
    const chefId = parseInt(req.query.chef);
    const recipeId = parseInt(req.query.recipe);
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 0;
    if (chefId) {
      if (!req.user) {
        return res.status(401).json({ error: "Must be logged in to view comments" });
      }
      const comments = await controller.getAllChefRecipeComments(chefId, limit, page);
      res.json(comments);
    } else if (recipeId) {
      const comments = await controller.getRecipeComments(recipeId, limit, page);
      res.json(comments);
    }
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'something went wrong' });
  }
});
router.post('/', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to comment" });
  }
  try {
    const userId = parseInt(req.body.userId);
    const recipeId = req.body.recipeId;
    const commentText = req.body.commentText;
    let parentCommentId = req.body.parentCommentId;
    const commentId = await controller.postRecipeComment(userId, recipeId, commentText, parentCommentId);
    res.json(commentId);
  }
  catch (error) {
    console.error('Error posting recipe comment:', error);
    res.status(500).json({ error: 'something went wrong' });
  }
});
router.delete('/:id', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to delet comment" });
  }
  try {
    const commentId = parseInt(req.params.id);
    const result = await controller.deleteRecipeComment(commentId);
    res.json(result);
  } catch (error) {
    console.error('Error deleting recipe comment:', error);
    res.status(500).json({ error: 'something went wrong' });
  }
})

module.exports = router;
