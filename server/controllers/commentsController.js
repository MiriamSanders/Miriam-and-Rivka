
const e = require('express');
const GenericDA = require('../services/GenericDA');
const commentsDA = require('../services/commentsDA');
exports.getRecipeComments = async (req, res) => {
  try {
      const recipeId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit) || 10; 
    const offset = parseInt(req.query.offset) || 0;

    const comments = await commentsDA.GetComments(recipeId, limit, 0);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
};