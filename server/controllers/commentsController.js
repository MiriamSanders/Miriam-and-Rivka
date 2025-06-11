
const e = require('express');
const commentsService = require('../services/commentsService');
exports.getRecipeComments = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 0;
    const offset = page * limit - limit;
    const comments = await commentsService.getRecipeComments(id, limit, offset);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
};
exports.getArticleComments = async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 0;
    const offset = page * limit - limit;
    const comments = await commentsService.getArticleComments(articleId, limit, offset);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
};
exports.postRecipeComments = async (req, res) => {
  try {
    const recipeId = req.body.recipeId;
    const userId = req.body.userId;
    const commentText = req.body.commentText;
    const commentId = await commentsService.postRecipeComments(recipeId, userId, commentText);
    res.json(commentId);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
}
exports.postArticleComments = async (req, res) => {
  try {
    const articleId = req.body.articleId;
    const userId = req.body.userId;
    const commentText = req.body.commentText;
    const commentId = await commentsService.postArticleComments(articleId, userId, commentText);
    res.json(commentId);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
}