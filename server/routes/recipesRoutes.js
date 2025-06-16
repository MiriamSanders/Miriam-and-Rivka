const express = require('express');
const router = express.Router();
const controller = require('../controllers/recipesController');

router.get('/recipes',controller.getAllRecipes);
router.get('/recipes/best-rated', controller.getbestRatedRecipes);
router.get('/recipes/:id', controller.getRecipeById);
router.post('/recipes', controller.createRecipe);
router.delete('/recipes/:id',async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to delet recipe" });
  }
controller.deleteRecipe(req,res);
})
router.put('/recipes/:id',async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to put recipe" });
  }
controller.putRecipe(req,res);
})
module.exports = router;