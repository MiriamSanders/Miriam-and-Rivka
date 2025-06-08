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
    console.log("Tags:", result.tags);
    
    return result;

  } catch (err) {
    console.error("Error:", err.message);
    throw err;
  } 
}
async function GetAllRecipes(limit, offset) {
  try {
    const db = await dbPromise;
    const query = `
      SELECT r.RecipeID, r.Title, r.ImageURL,r.Category,r.Description,u.UserName,t.Name
      FROM recipes r
      JOIN Users u ON r.ChefID = u.UserID
     LEFT JOIN recipetags p ON r.RecipeID=p.RecipeID
     LEFT JOIN tags t ON p.TagID =t.TagID 
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const [rows] = await db.execute(query);
    return rows;

  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
}
module.exports = {
    getRecipeById,
    GetAllRecipes
};