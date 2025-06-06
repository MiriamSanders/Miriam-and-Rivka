const e = require('express');
const GenericDA = require('../services/GenericDA');
const RecipeDA = require('../services/recipeDA');
exports.getAllRecipes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; 
    const offset = parseInt(req.query.offset) || 0;

    const recipes = await GenericDA.GenericGetAll('recipes',  limit, 0,["RecipeID","ChefID","Title","ImageURL","Category","Description"]);
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
};

exports.getRecipeById = async (req, res) => { 
  const recipeId = parseInt(req.params.id);
  if (isNaN(recipeId)) {
    return res.status(400).json({ error: 'Invalid recipe ID' });
  }

  try {
    console.log('Fetching recipe with ID:', recipeId)
    const recipe = await RecipeDA.getRecipeById(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
}
exports.createRecipe = async (req, res) => {
  const { ChefID, Title, ImageURL, Category, Description ,} = req.body;

  if (!ChefID || !Title || !ImageURL || !Category || !Description) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newRecipe = await GenericDA.GenericPost({
      ChefID,
      Title,
      ImageURL,
      Category,
      Description
    });
    res.status(201).json(newRecipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
}