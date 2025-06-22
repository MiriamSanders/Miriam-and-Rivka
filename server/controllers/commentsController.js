
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
exports.getAllChefRecipeComments = async (req, res) => {
  try {
    const chefId = parseInt(req.params.chefId);
   const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 0;
    const offset = page * limit;
    const comments = await commentsService.getAllChefRecipeComments(chefId, limit, offset);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
}
exports.getAllChefArticleComments = async (req, res) => {
  try {   
    const chefId = parseInt(req.params.chefId);
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 0;
    const offset = page * limit;
    const comments = await commentsService.getAllChefArticleComments(chefId, limit, offset);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
}
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
exports.postChefRecipeComment = async (req, res) => {
  try {
    const chefId = parseInt(req.params.chefId);
    const recipeId = req.body.recipeId;
    const commentText = req.body.commentText;
    const parentCommentId= req.body.parentCommentId;
    const commentId = await commentsService.postChefRecipeComment(chefId, recipeId, commentText,parentCommentId);
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
exports.postChefArticleComment = async (req, res) => {
  try {
    const chefId = parseInt(req.params.chefId);
    const articleId = req.body.articleId;
    const commentText = req.body.commentText;
    const parentCommentId= req.body.parentCommentId;
    const commentId = await commentsService.postChefArticleComment(chefId, articleId, commentText,parentCommentId);
    res.json(commentId);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
}
exports.deleteArticleComment = async (req, res) => {
  try {
   const commentId = parseInt(req.params.id);
    const result=await commentsService.deleteArticleComment(commentId);
     res.json(result);
  } catch (error) {
    console.error('Error delet comment:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
}
exports.deleteRecipeComment = async (req, res) => {
  try {
   const commentId = parseInt(req.params.id);
    const result=await commentsService.deleteRecipeComment(commentId);
    res.json(result);
  } catch (error) {
    console.error('Error delet comment:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
}