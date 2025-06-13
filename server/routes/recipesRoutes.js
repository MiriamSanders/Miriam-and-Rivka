const express = require('express');
const router = express.Router();
const controller = require('../controllers/recipesController');

router.get('/recipes',controller.getAllRecipes);
router.get('/recipes/best-rated', controller.getbestRatedRecipes);
router.get('/recipes/:id', controller.getRecipeById);
router.post('/recipes', controller.createRecipe);

module.exports = router;