const mysql = require('mysql2/promise');
const dbPromise = require("./dbConnection"); 
async function getRecipeById(recipeId) {
    try {
    const result = {};
    const db = await dbPromise;
    // 1. Get the recipe itself with the chef name
    const [recipeRows] = await db.execute(
      `SELECT r.recipeId, r.title, r.description, r.imageURL, r.instructions,
              r.prepTimeMinutes, r.difficulty, r.category, r.dishType,
              u.userName AS chefName
       FROM recipes r
       JOIN chefs c ON r.chefID = c.chefID
       JOIN users u ON c.chefID = u.userID
       WHERE r.recipeId = ?`,
       [recipeId]
    );

    if (recipeRows.length === 0) {
      throw new Error('Recipe not found');
    }

    result.recipe = recipeRows[0];

    // 2. Get ingredients
    const [ingredients] = await db.execute(
      `SELECT i.name, ri.quantity, ri.orderIndex
       FROM recipeIngredients ri
       JOIN ingredients i ON ri.ingredientID = i.ingredientID
       WHERE ri.recipeId = ?
       ORDER BY ri.orderIndex`, [recipeId]
    );
    console.log("Ingredients:", ingredients);
    
    result.ingredients = ingredients;

    // 3. Get tags
    const [tags] = await db.execute(
      `SELECT t.name
       FROM recipeTags rt
       JOIN tags t ON rt.tagId = t.tagId
       WHERE rt.recipeId = ?`, [recipeId]
    );

    result.tags = tags.map(t => t.name); // simplify to array of strings
    console.log("Tags:", result.tags);
    
    return result;

  } catch (err) {
    console.error("Error:", err.message);
    throw err;
  } 
}
async function getAllRecipes(limit, offset) {
  try {
    const db = await dbPromise;
    const query = `
      SELECT r.recipeId, r.title, r.imageURL,r.category,r.description,u.userName,t.name
      FROM recipes r
      JOIN users u ON r.chefId = u.userId
     LEFT JOIN recipetags p ON r.recipeId=p.recipeId
     LEFT JOIN tags t ON p.tagId =t.tagId
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
    getAllRecipes
};