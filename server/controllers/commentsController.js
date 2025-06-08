
const e = require('express');
const GenericDA = require('../services/GenericDA');
const commentsDA = require('../services/commentsDA');
exports.getRecipeComments = async (req, res) => {
  try {
      const Id = parseInt(req.params.id);
    const limit = parseInt(req.query.limit) || 10; 
    const page= parseInt(req.query.page) || 0;
        const offset = page * limit-limit;
    const comments = await commentsDA.GetRecipeComments(Id, limit, offset);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
};
exports.getArticleComments = async (req, res) => {
  try {
      const ArticleID = parseInt(req.params.id);
    const limit = parseInt(req.query.limit) || 10; 
    const page= parseInt(req.query.page) || 0;
        const offset = page * limit-limit;
    const comments = await commentsDA.GetArticleComments(ArticleID, limit, offset);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
};
exports.postRecipeComments=async (req,res)=>{
   try {
    const RecipeID=req.body.RecipeID;
    const userID=req.body.UserID;
    const CommentText=req.body.CommentText;
    const CommentID = await commentsDA.postRecipeComments(RecipeID,userID,CommentText);
    res.json(CommentID);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
}
exports.postArticleComments=async (req,res)=>{
   try {
    const ArticleID=req.body.ArticleID;
    const userID=req.body.UserID;
    const CommentText=req.body.CommentText;
    const CommentID = await commentsDA.postArticleComments(ArticleID,userID,CommentText);
    res.json(CommentID);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
}