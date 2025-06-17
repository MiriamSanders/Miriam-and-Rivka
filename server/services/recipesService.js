const mysql = require('mysql2/promise');
const dbPromise = require("./dbConnection");
async function getRecipeById(recipeId) {
  try {
    const result = {};
    const db = await dbPromise;
    // 1. Get the recipe itself with the chef name
    const [recipeRows] = await db.execute(
      `SELECT r.recipeId, r.title, r.description, r.imageURL, r.instructions,c.chefID,
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
async function getAllRecipes(limit, offset = 0) {
  try {
    const db = await dbPromise;
    const query = `
  SELECT 
    r.recipeId, 
    r.title, 
    r.imageURL, 
    r.category, 
    r.description, 
    r.dishType,
    r.dishType,
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
async function getRecipesAdvanced(options = {}) {
  const {
    limit = 10,
    offset = 0,
    category,
    chefName,
    title,
    tags = [],
    anyTags = [],
    sortBy = 'recipeId',
    sortOrder = 'DESC'
  } = options;

  // Validate sortBy to prevent SQL injection
  const allowedSortFields = ['title', 'category', 'userName'];
  const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'recipeId';
  const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

  try {
    const db = await dbPromise;

    let query = `
      SELECT 
        r.recipeId,
        r.title,
        r.imageURL,
        r.category,
        r.description,
        r.dishType,
        u.userName,
        GROUP_CONCAT(DISTINCT t.name ORDER BY t.name SEPARATOR ',') AS tags
      FROM recipes r
      JOIN users u ON r.chefId = u.userId
      LEFT JOIN recipetags p ON r.recipeId = p.recipeId
      LEFT JOIN tags t ON p.tagId = t.tagId
    `;

    const conditions = [];
    const params = [];

    if (category) {
      conditions.push('r.category = ?');
      params.push(category);
    }

    if (chefName) {
      conditions.push('u.userName LIKE ?');
      params.push(`%${chefName}%`);
    }

    if (title) {
      conditions.push('r.title LIKE ?');
      params.push(`%${title}%`);
    }

    // Specific tags (AND logic) - must have ALL tags
    if (tags.length > 0) {
      const tagPlaceholders = tags.map(() => '?').join(',');
      conditions.push(`r.recipeId IN (
        SELECT rt.recipeId 
        FROM recipetags rt 
        JOIN tags tg ON rt.tagId = tg.tagId 
        WHERE tg.name IN (${tagPlaceholders})
        GROUP BY rt.recipeId 
        HAVING COUNT(DISTINCT tg.name) = ?
      )`);
      params.push(...tags, tags.length);
    }

    // Any tags (OR logic) - must have ANY of these tags
    if (anyTags.length > 0) {
      const tagPlaceholders = anyTags.map(() => '?').join(',');
      conditions.push(`r.recipeId IN (
        SELECT DISTINCT rt.recipeId 
        FROM recipetags rt 
        JOIN tags tg ON rt.tagId = tg.tagId 
        WHERE tg.name IN (${tagPlaceholders})
      )`);
      params.push(...anyTags);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += `
      GROUP BY r.recipeId, r.title, r.imageURL, r.category, r.description, r.dishType, u.userName
      ORDER BY r.${validSortBy} ${validSortOrder}
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    console.log('Executing query:', query);
    console.log('With params:', params);

    // Execute query - MySQL2 returns [rows, fields]
    const [rows] = await db.execute(mysql.format(query, params));

    // Transform the results
    const results = rows.map(row => ({
      recipeId: row.recipeId,
      title: row.title,
      imageURL: row.imageURL,
      category: row.category,
      description: row.description,
      dishType: row.dishType,
      userName: row.userName,
      tags: row.tags ? row.tags.split(',').map(tag => tag.trim()) : []
    }));

    return results;

  } catch (error) {
    console.error('Error fetching recipes:', error);
    //  console.error('Query:', query);
    //  console.error('Params:', params);
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
    const recipe = await db.execute(
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
async function deleteRecipe(recipeId) {
   try{
         const db = await dbPromise;
          const query = `DELETE FROM recipes WHERE recipeId = ?`;
          const [result] = await db.execute(query, [recipeId]);
          return result.affectedRows > 0;
        } catch (err) {
          console.error("Error deleting recipe:", err);
          return false;
        }
}
async function putRecipe(recipeId, updatedData) {
  const db = await dbPromise;
  try {
    // עדכון מתכון ראשי
    await db.execute(
      `UPDATE recipes
       SET title = ?, description = ?, imageURL = ?, instructions = ?,
           prepTimeMinutes = ?, difficulty = ?, category = ?, dishType = ?
       WHERE recipeId = ?`,
      [
        updatedData.title,
        updatedData.description,
        updatedData.imageURL,
        updatedData.instructions,
        updatedData.prepTimeMinutes,
        updatedData.difficulty,
        updatedData.category,
        updatedData.dishType,
        recipeId,
      ]
    );

    // מחיקת תגיות קיימות
    await db.execute(`DELETE FROM recipeTags WHERE recipeId = ?`, [recipeId]);

    // הוספת תגיות חדשות
    if (Array.isArray(updatedData.tags)) {
      for (const tagName of updatedData.tags) {
        // בדיקה אם התגית כבר קיימת
        const [tagRows] = await db.execute(`SELECT tagId FROM tags WHERE name = ?`, [tagName]);
        let tagId;

        if (tagRows.length > 0) {
          tagId = tagRows[0].tagId;
        } else {
          // אם לא קיימת, יוצרים תגית חדשה
          const [insertResult] = await db.execute(`INSERT INTO tags (name) VALUES (?)`, [tagName]);
          tagId = insertResult.insertId;
        }

        // הכנסת הקשר בין מתכון לתגית
        await db.execute(`INSERT INTO recipeTags (recipeId, tagId) VALUES (?, ?)`, [recipeId, tagId]);
      }
    }

    return { succeeded: true };
  } catch (err) {
    console.error("Update error:", err);
    return { succeeded: false, error: err.message };}
}
async function updateRecipeById(updatedRecipeData) {
  try {
    const db = await dbPromise;

    const updateQuery = mysql.format(`
      UPDATE recipes SET
        title = ?,
        description = ?,
        imageURL = ?,
        instructions = ?,
        prepTimeMinutes = ?,
        difficulty = ?,
        category = ?,
        dishType = ?
      WHERE recipeId = ?
    `, [
      updatedRecipeData.title,
      updatedRecipeData.description,
     updatedRecipeData. imageURL,
      updatedRecipeData.instructions,
      updatedRecipeData.prepTimeMinutes,
      updatedRecipeData.difficulty,
      updatedRecipeData.category,
      updatedRecipeData.dishType,
      updatedRecipeData.recipeId
    ]);

    await db.execute(updateQuery);
const newQuery=mysql.format(`SELECT * FROM recipes WHERE recipeId = ?`, [ updatedRecipeData.recipeId]);
    const [rows] = await db.execute(newQuery);
    return rows[0] || null;
  } catch (error) {
    console.error("Error updating recipe:", error);
    throw error;
  }
}


module.exports = {
  getRecipeById,
  getAllRecipes,
  getRecipesAdvanced,
  getBestRatedRecipes,
  getRecipesByChefId
};