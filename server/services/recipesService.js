const mysql = require('mysql2/promise');
const dbPromise = require('./dbConnection');
const genericService = require('./genericService');

async function getRecipeById(recipeId) {
  try {
    const db = await dbPromise;
    const [recipeRows] = await db.execute(
      `SELECT r.recipeId, r.title, r.description, r.imageURL, r.instructions, c.chefID,
              r.prepTimeMinutes, d.name AS difficulty, r.category, r.dishType,
              u.userName AS chefName
       FROM recipes r
       JOIN chefs c  ON r.chefID = c.chefID
       JOIN users u  ON c.chefID = u.userID
       JOIN difficulty d ON d.difficultyId = r.difficulty
       WHERE r.recipeId = ?`,
      [recipeId]
    );
    if (!recipeRows.length) throw new Error('Recipe not found');

    const [ingredients] = await db.execute(
      `SELECT i.name, ri.quantity, ri.orderIndex
       FROM recipeIngredients ri
       JOIN ingredients i ON ri.ingredientID = i.ingredientID
       WHERE ri.recipeId = ?
       ORDER BY ri.orderIndex`,
      [recipeId]
    );

    const [tags] = await db.execute(
      `SELECT t.name
       FROM recipeTags rt
       JOIN tags t ON rt.tagId = t.tagId
       WHERE rt.recipeId = ?`,
      [recipeId]
    );

    return {
      recipe: recipeRows[0],
      ingredients,
      tags: tags.map(t => t.name)
    };
  } catch (err) {
    console.error('getRecipeById - DB error:', err);
    throw err;
  }
}
async function getRecipesAdvanced(options = {}) {
  const {
    limit = 10,
    offset = 0,
    category,
    dishType,
    chefName,
    title,
    tags = [],
    anyTags = [],
    sortBy = 'recipeId',
    sortOrder = 'DESC'
  } = options;

  // Updated to include 'rating' as a valid sort field
  const allowedSortFields = ['title', 'category', 'userName', 'dishType', 'rating'];
  const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'recipeId';
  const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase())
    ? sortOrder.toUpperCase()
    : 'DESC';

  try {
    const db = await dbPromise;
    let query = `
      SELECT r.recipeId, r.title, r.imageURL, r.category, r.description, r.dishType,
             u.userName, u.userId,
             GROUP_CONCAT(DISTINCT t.name ORDER BY t.name SEPARATOR ',') AS tags,
             COALESCE(AVG(rt.rating), 0) AS avgRating,
             COUNT(DISTINCT rt.userId) AS ratingCount
      FROM recipes r
      JOIN users u ON r.chefId = u.userId
      LEFT JOIN recipetags p ON r.recipeId = p.recipeId
      LEFT JOIN tags t ON p.tagId = t.tagId
      LEFT JOIN recipeRatings rt ON r.recipeId = rt.recipeId`;

    const conditions = [];
    const params = [];

    if (category) {
      conditions.push('r.category = ?');
      params.push(category);
    }

    if (dishType) {
      conditions.push('r.dishType = ?');
      params.push(dishType);
    }

    if (chefName) {
      conditions.push('u.userName = ?');
      params.push(`${chefName}`);
    }

    if (title) {
      conditions.push('r.title LIKE ?');
      params.push(`%${title}%`);
    }

    if (tags.length) {
      const ph = tags.map(() => '?').join(',');
      conditions.push(`r.recipeId IN (
        SELECT rt.recipeId
        FROM recipetags rt
        JOIN tags tg ON rt.tagId = tg.tagId
        WHERE tg.name IN (${ph})
        GROUP BY rt.recipeId
        HAVING COUNT(DISTINCT tg.name) = ?)`);
      params.push(...tags, tags.length);
    }

    if (anyTags.length) {
      const ph = anyTags.map(() => '?').join(',');
      conditions.push(`r.recipeId IN (
        SELECT DISTINCT rt.recipeId
        FROM recipetags rt
        JOIN tags tg ON rt.tagId = tg.tagId
        WHERE tg.name IN (${ph}))`);
      params.push(...anyTags);
    }

    if (conditions.length) query += ` WHERE ${conditions.join(' AND ')}`;

    query += `
      GROUP BY r.recipeId, r.title, r.imageURL, r.category, r.description,
               r.dishType, u.userName, u.userId`;

    // Handle the ORDER BY clause - use avgRating for 'rating' sort
    const sortField = validSortBy === 'rating' ? 'avgRating' : `r.${validSortBy}`;
    query += ` ORDER BY ${sortField} ${validSortOrder}`;

    query += ` LIMIT ? OFFSET ?`;

    params.push(limit, offset);
    const formattedQuery = mysql.format(query, params);

    const [rows] = await db.execute(formattedQuery);

    return rows.map(r => ({
      recipeId: r.recipeId,
      title: r.title,
      imageURL: r.imageURL,
      category: r.category,
      description: r.description,
      dishType: r.dishType,
      userName: r.userName,
      chefId: r.userId,
      tags: r.tags ? r.tags.split(',').map(t => t.trim()) : [],
      avgRating: parseFloat(r.avgRating) || 0,
      ratingCount: r.ratingCount || 0
    }));
  } catch (error) {
    console.error('getRecipesAdvanced - DB error:', error);
    throw error;
  }
}
async function getBestRatedRecipes(limit = 4) {
  try {
    const db = await dbPromise;
    const [ratingRows] = await db.execute(
      `SELECT recipeId, AVG(rating) AS avgRating
       FROM reciperatings
       GROUP BY recipeId
       ORDER BY avgRating DESC
       LIMIT 4`, [limit]
    );

    const ids = ratingRows.map(r => r.recipeId);
    const recipes = [];

    for (const id of ids) {
      const [rRows] = await db.execute(
        `SELECT r.recipeId, r.title, r.imageURL, r.description,
                u.userName AS chefName
         FROM recipes r
         JOIN users u ON r.chefId = u.userId
         WHERE r.recipeId = ?`, [id]
      );
      if (rRows.length) recipes.push(rRows[0]);
    }
    return recipes;
  } catch (error) {
    console.error('getBestRatedRecipes - DB error:', error);
    throw error;
  }
}
async function getRecipesByChefId(chefId) {
  try {
    const db = await dbPromise;
    const [rows] = await db.execute(
      `SELECT r.recipeId, r.title, r.imageURL, r.description,
              u.userName AS chefName
       FROM recipes r
       JOIN users u ON r.chefId = u.userId
       WHERE r.chefId = ?`, [chefId]
    );
    return rows;
  } catch (error) {
    console.error('getRecipesByChefId - DB error:', error);
    throw error;
  }
}
async function deleteRecipe(recipeId) {
  try {
    const db = await dbPromise;
    const [res] = await db.execute('DELETE FROM recipes WHERE recipeId = ?', [recipeId]);
    return res.affectedRows > 0;
  } catch (err) {
    console.error('deleteRecipe - DB error:', err);
    return false;
  }
}
async function putRecipe(recipeId, updated) {
  try {
    const db = await dbPromise;
    await db.execute(
      `UPDATE recipes
       SET title = ?, description = ?, imageURL = ?, instructions = ?,
           prepTimeMinutes = ?, difficulty = ?, category = ?, dishType = ?
       WHERE recipeId = ?`,
      [
        updated.title, updated.description, updated.imageURL, updated.instructions,
        updated.prepTimeMinutes, updated.difficulty, updated.category,
        updated.dishType, recipeId
      ]
    );
    await db.execute('DELETE FROM recipeTags WHERE recipeId = ?', [recipeId]);

    if (Array.isArray(updated.tags)) {
      for (const tag of updated.tags) {
        const [tagRows] = await db.execute('SELECT tagId FROM tags WHERE name = ?', [tag]);
        let tagId = tagRows.length ? tagRows[0].tagId : null;
        if (!tagId) {
          const [ins] = await db.execute('INSERT INTO tags (name) VALUES (?)', [tag]);
          tagId = ins.insertId;
        }
        await db.execute('INSERT INTO recipeTags (recipeId, tagId) VALUES (?, ?)', [recipeId, tagId]);
      }
    }
    return { succeeded: true };
  } catch (err) {
    console.error('putRecipe - DB error:', err);
    return { succeeded: false, error: err.message };
  }
}
async function updateRecipeById(id, data) {
  try {
    const db = await dbPromise;
    const q = mysql.format(
      `UPDATE recipes SET title=?, description=?, imageURL=?, instructions=?,
       prepTimeMinutes=?, difficulty=?, category=?, dishType=? WHERE recipeId=?`,
      [
        data.title, data.description, data.imageURL, data.instructions,
        data.prepTimeMinutes, data.difficulty, data.category, data.dishType, id
      ]
    );
    await db.execute(q);
    const [rows] = await db.execute('SELECT * FROM recipes WHERE recipeId = ?', [id]);
    return rows[0] || null;
  } catch (err) {
    console.error('updateRecipeById - DB error:', err);
    throw err;
  }
}
async function getRecipeIngredients(recipeId) {
  try {
    const db = await dbPromise;
    const [rows] = await db.execute(
      'SELECT ingredientId, quantity, orderIndex FROM recipeingredients WHERE recipeId = ?',
      [recipeId]
    );
    return rows;
  } catch (err) {
    console.error('getRecipeIngredients - DB error:', err);
    throw err;
  }
}
async function insertRecipeIngredient(recipeId, ing) {
  try {
    const db = await dbPromise;
    await db.execute(
      `INSERT INTO recipeingredients (recipeId, ingredientId, quantity, orderIndex)
       VALUES (?, ?, ?, ?)`,
      [recipeId, ing.ingredientId, ing.quantity, ing.orderIndex]
    );
  } catch (err) {
    console.error('insertRecipeIngredient - DB error:', err);
    throw err;
  }
}
async function updateRecipeIngredient(recipeId, ing) {
  try {
    const db = await dbPromise;
    await db.execute(
      `UPDATE recipeingredients SET quantity = ?, orderIndex = ?
       WHERE recipeId = ? AND ingredientId = ?`,
      [ing.quantity, ing.orderIndex, recipeId, ing.ingredientId]
    );
  } catch (err) {
    console.error('updateRecipeIngredient - DB error:', err);
    throw err;
  }
}
async function deleteRecipeIngredient(recipeId, ingredientId) {
  try {
    const db = await dbPromise;
    await db.execute(
      'DELETE FROM recipeingredients WHERE recipeId = ? AND ingredientId = ?',
      [recipeId, ingredientId]
    );
  } catch (err) {
    console.error('deleteRecipeIngredient - DB error:', err);
    throw err;
  }
}
async function deleteRecipeTag(recipeId, tagId) {
  try {
    const db = await dbPromise;
    const [res] = await db.execute(
      'DELETE FROM recipeTags WHERE recipeId = ? AND tagId = ?',
      [recipeId, tagId]
    );
    return res.affectedRows;
  } catch (err) {
    console.error('deleteRecipeTag - DB error:', err);
    throw err;
  }
}
async function postRecipe(data) {
  const newRecipe = await genericService.genericPost('recipes', data, 'recipeId');
  return newRecipe;
}
async function getDifficultyByName(name) {
  const result = await genericService.genericGet("difficulty", "name", name);
  return result;
}
async function createDifficulty(name) {
  return await genericService.genericPost("difficulty", { name }, "difficultyId");
}
module.exports = {
  getRecipeById,
  getBestRatedRecipes,
  getRecipesByChefId,
  deleteRecipe,
  putRecipe,
  updateRecipeById,
  getRecipesAdvanced,
  getRecipeIngredients,
  insertRecipeIngredient,
  updateRecipeIngredient,
  deleteRecipeIngredient,
  deleteRecipeTag,
  createDifficulty,
  getDifficultyByName,
  postRecipe
};
