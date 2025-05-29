const mysql = require('mysql2/promise');
const dbPromise = require("./dbConnection"); 
async function getRecipeById(recipeId) {
    try {
        
    const result = {};
    const db = await dbPromise;
    // 1. Get the recipe itself with the chef name
    const [recipeRows] = await db.execute(
      `SELECT r.RecipeID, r.Title, r.Description, r.ImageURL, r.Instructions,
              r.PrepTimeMinutes, r.Difficulty, r.Category, r.DishType,
              u.UserName AS ChefName
       FROM Recipes r
       JOIN Chefs c ON r.ChefID = c.ChefID
       JOIN Users u ON c.ChefID = u.UserID
       WHERE r.RecipeID = ?`,
       [recipeId]
    );

    if (recipeRows.length === 0) {
      throw new Error('Recipe not found');
    }

    result.recipe = recipeRows[0];

    // 2. Get ingredients
    const [ingredients] = await db.execute(
      `SELECT i.Name, ri.Quantity, ri.OrderIndex
       FROM RecipeIngredients ri
       JOIN Ingredients i ON ri.IngredientID = i.IngredientID
       WHERE ri.RecipeID = ?
       ORDER BY ri.OrderIndex`, [recipeId]
    );
    console.log("Ingredients:", ingredients);
    
    result.ingredients = ingredients;

    // 3. Get tags
    const [tags] = await db.execute(
      `SELECT t.Name
       FROM RecipeTags rt
       JOIN Tags t ON rt.TagID = t.TagID
       WHERE rt.RecipeID = ?`, [recipeId]
    );

    result.tags = tags.map(t => t.Name); // simplify to array of strings

    return result;

  } catch (err) {
    console.error("Error:", err.message);
    throw err;
  } 
}
module.exports = {
    getRecipeById
};