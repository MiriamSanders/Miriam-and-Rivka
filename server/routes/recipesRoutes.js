const express = require('express');
const router = express.Router();
const controller = require('../controllers/recipesController');

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const filterOptions = {
      limit,
      page,
      category: req.query.category,
      chefName: req.query.chefName,
      dishType: req.query.dishType,
      title: req.query.title,
      userId: req.query.userId,
      tags: req.query.tags ? req.query.tags.split(',') : [],
      anyTags: req.query.anyTags ? req.query.anyTags.split(',') : [],
      sortBy: req.query.sort || 'recipeId',
      sortOrder: req.query.sortOrder || 'DESC'
    };

    const recipes = await controller.getAllRecipes(filterOptions);
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const recipeId = req.params.id;
    const recipe = await controller.getRecipeById(recipeId);
    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'something went wrong' });
  }
});
router.post('/', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to create recipe" });
  }
  try {
    const newRecipe = await controller.createRecipe(req.body);
    res.status(201).json(newRecipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'something went wrong' });
  }
});
router.delete('/:id', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to delete recipe" });
  }
  try {
    const recipeId = req.params.id;
    const result = await controller.deleteRecipe(recipeId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'something went wrong' });
  }
});
router.put('/:id', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to put recipe" });
  }
  try {
    const recipeId = req.params.id;
    const updatedRecipe = await controller.putRecipe(recipeId, req.body);
    res.json(updatedRecipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: 'something went wrong' });
  }
})
module.exports = router;