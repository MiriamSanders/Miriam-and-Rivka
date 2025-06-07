const express = require('express');
const router = express.Router();
const Controller = require('../controllers/recipesController');

router.get('/recipes',Controller.getAllRecipes);
router.get('/recipes/:id', Controller.getRecipeById);
router.post('/recipes', Controller.createRecipe);
module.exports = router;