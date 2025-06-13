const mysql = require('mysql2/promise');
const dbPromise = require("./dbConnection"); 
async function getRecipeById(recipeId) {
    try {
    const result = {};
    const db = await dbPromise;
    // 1. Get the recipe itself with the chef name
    const [recipeRows] = await db.execute(
      `SELECT r.recipeId, r.title, r.description, r.imageURL, r.instructions,
              r.prepTimeMinutes, d.name, r.category, r.dishType,
              u.userName AS chefName
       FROM recipes r
       JOIN chefs c ON r.chefID = c.chefID
       JOIN users u ON c.chefID = u.userID
       JOIN difficulty d on d.difficultyId =r.difficulty
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
async function getAllRecipes(limit, offset=0) {
  try {
    const db = await dbPromise;
  const query = `
  SELECT 
    r.recipeId, 
    r.title, 
    r.imageURL, 
    r.category, 
    r.description, 
    u.userName, 
    GROUP_CONCAT(t.name) AS tags
  FROM recipes r
  JOIN users u ON r.chefId = u.userId
  LEFT JOIN recipetags p ON r.recipeId = p.recipeId
  LEFT JOIN tags t ON p.tagId = t.tagId
  GROUP BY r.recipeId, r.title, r.imageURL, r.category, r.description, u.userName
  LIMIT ${limit}
  OFFSET ${offset}
`;

    const [rows] = await db.execute(query);
    console.log("All Recipes:", rows);
    
    return rows;

  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
}
async function getBestRatedRecipes(limit = 4) {
    const db = await dbPromise;
    const [rows] = await db.execute(
        `SELECT recipeId, AVG(rating) as avgRating 
         FROM reciperatings 
         GROUP BY recipeId 
         ORDER BY avgRating DESC 
         LIMIT 4`
    );
    console.log(rows);
    
    let recipeIds = rows.map(row => row.recipeId);
    console.log(recipeIds);
    
    let recipes = [];
    for (let row of recipeIds) {
        const recipe =await db.execute(
            `SELECT r.recipeId, r.title, r.imageURL, r.description, u.userName AS chefName
             FROM recipes r
             JOIN users u ON r.chefId = u.userId
             WHERE r.recipeId = ?`, [row]
        );
        recipes.push(recipe[0][0]); // Assuming recipe[0][0] is the recipe object
      }
   return recipes;
}
async function getRecipesByChefId(chefId) {
    try {
        const db = await dbPromise;
        const [rows] = await db.execute(
            `SELECT r.recipeId, r.title, r.imageURL, r.description, u.userName AS chefName
             FROM recipes r
             JOIN users u ON r.chefId = u.userId
             WHERE r.chefId = ?`, [chefId]
        );
        console.log("Recipes by Chef ID:", rows);
        
        return rows;
    } catch (error) {
        console.error('Error fetching recipes by chef ID:', error);
        throw error;
    }
}
module.exports = {
    getRecipeById,
    getAllRecipes,
    getBestRatedRecipes,
    getRecipesByChefId
};