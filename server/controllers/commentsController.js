
const e = require('express');
const commentsService = require('../services/commentsService');
const genericService = require('../services/genericService');
exports.getRecipeComments = async (recipeId, limit, page) => {
  try {
    const offset = page * limit - limit;
    const comments = await commentsService.getRecipeComments(recipeId, limit, offset);
    return comments;
  } catch (error) {
    throw new Error('somthing went wrong:', error);
  }
};
exports.getArticleComments = async (articleId, limit, page) => {
  try {
    const offset = page * limit - limit;
    const comments = await commentsService.getArticleComments(articleId, limit, offset);
    return comments;
  } catch (error) {
    throw new Error('somthing went wrong:', error);
  }
};
exports.getAllChefRecipeComments = async (chefId, limit, page) => {
  try {
    const offset = page * limit;
    const comments = await commentsService.getAllChefRecipeComments(chefId, limit, offset);
    return comments;
  } catch (error) {
    throw new Error('somthing went wrong:', error);
  }
}
exports.getAllChefArticleComments = async (chefId, limit, page) => {
  try {
    const offset = page * limit;
    const comments = await commentsService.getAllChefArticleComments(chefId, limit, offset);
    return comments;
  } catch (error) {
    throw new Error('somthing went wrong:', error);
  }
}
exports.postRecipeComment = async (userId, recipeId, commentText, parentCommentId) => {
  try {
    if (!parentCommentId) {
      parentCommentId = null;
    }
    const commentId = await commentsService.postRecipeComment(userId, recipeId, commentText, parentCommentId);
    return commentId;
  } catch (error) {
    throw new Error('somthing went wrong:', error);
  }
}
exports.postArticleComment = async (userId, articleId, commentText, parentCommentId) => {
  try {
    if (!parentCommentId) {
      parentCommentId = null;
    }
    const commentId = await commentsService.postArticleComment(userId, articleId, commentText, parentCommentId);
    return commentId
  } catch (error) {
    throw new Error('Error posting article comment:', error);
  }
}
exports.deleteArticleComment = async (commentId) => {
  try {
    const result = await genericService.genericDelete('articlecomments', commentId, 'commentId');
    return result;
  } catch (error) {
    throw new Error('Error deleting article comment:', error);
  }
}
exports.deleteRecipeComment = async (commentId) => {
  try {
    const result = await genericService.genericDelete('recipecomments', commentId, 'commentId');
    return result;
  } catch (error) {
    throw new Error('something went wrong:', error);
  }
}