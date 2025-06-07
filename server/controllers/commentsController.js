
const e = require('express');
const GenericDA = require('../services/GenericDA');
const commentsDA = require('../services/commentsDA');
exports.getRecipeComments = async (req, res) => {
  try {
      const recipeId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit) || 10; 
    const offset = parseInt(req.query.page) || 0;
    const comments = await commentsDA.GetComments(recipeId, limit, offset);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
};
exports.postComments=async (req,res)=>{
   try {
    const recipeId=req.body.RecipeID;
    const userID=req.body.UserID;
    const CommentText=req.body.CommentText;
    const CommentID = await commentsDA.postComments(recipeId,userID,CommentText);
    res.json(CommentID);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
}