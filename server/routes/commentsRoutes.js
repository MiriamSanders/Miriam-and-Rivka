const express = require('express');
const router = express.Router();
const controller = require('../controllers/commentsController');
//split this
router.get('/recipecomments/chef/:chefId', async (req, res) => {
  // if (!req.user) {
  //   return res.status(401).json({ error: "Must be logged in to view comments" });
  // }
  controller.getAllChefRecipeComments(req, res);
});
router.get('/recipecomments/:id', controller.getRecipeComments);
router.get('/articlecomments/chef/:chefId', async (req, res) => {
  // if (!req.user) {
  //   return res.status(401).json({ error: "Must be logged in to view comments" });
  // }
  controller.getAllChefArticleComments(req, res);
});
router.get('/articlecomments/:id', controller.getArticleComments);
router.post('/articlecomments/chef/:chefId',async (req, res) => {
  // if (!req.user) {
  //   return res.status(401).json({ error: "Must be logged in to comment" });
  // }
controller.postChefArticleComment(req,res);
});
router.post('/recipecomments/chef/:chefId',async (req, res) => {
  // if (!req.user) {
  //   return res.status(401).json({ error: "Must be logged in to comment" });
  // }
controller.postChefRecipeComment(req,res);
});
router.post('/recipecomments',async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to comment" });
  }
controller.postRecipeComments(req,res);
});
router.post('/articlecomments',async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to comment" });
  }
controller.postArticleComments(req,res);
});
router.delete('/recipecomments/:id',async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to delete comment" });
  }
controller.deleteRecipeComment(req,res);
})
router.delete('/articlecomments/:id',async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to delete comment" });
  }
controller.deleteArticleComment(req,res);
})
module.exports = router;
