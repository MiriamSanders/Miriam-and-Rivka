// dbService.js
const mysql = require('mysql2/promise');
const dbPromise = require('./dbConnection');

async function getRecipeDetailsFromDb(recipeIds = [], userId) {
    try {
        if (!recipeIds.length) return [];

        const db = await dbPromise;
        const placeholders = recipeIds.map(() => '?').join(',');
        const sql = `
      SELECT r.recipeId,
             r.title,
             r.category,
             r.dishType,
             COALESCE(AVG(rr.rating), 0) AS avgRating,
             COALESCE(MAX(ur.rating), 0) AS userRating,
             GROUP_CONCAT(DISTINCT t.name) AS tags
      FROM recipes r
      LEFT JOIN recipeRatings rr ON r.recipeId = rr.recipeId
      LEFT JOIN recipeRatings ur ON r.recipeId = ur.recipeId AND ur.userId = ?
      LEFT JOIN recipetags rt ON r.recipeId = rt.recipeId
      LEFT JOIN tags t ON rt.tagId = t.tagId
      WHERE r.recipeId IN (${placeholders})
      GROUP BY r.recipeId, r.title, r.category, r.dishType`;
        const [rows] = await db.execute(sql, [userId, ...recipeIds]);
        return rows.map(r => ({ ...r, recipeId: String(r.recipeId) }));
    } catch (error) {
        console.error('getRecipeDetailsFromDb - DB error:', error);
        throw error;
    }
}

async function getBackupRecipesFromDb(preferredCategory, dishType, userId, excludeIds = []) {
    try {
        const db = await dbPromise;
        const excludeSQL = excludeIds.length
            ? `AND r.recipeId NOT IN (${excludeIds.map(() => '?').join(',')})`
            : '';

        let sql = `
      SELECT r.recipeId, r.title, r.category, r.dishType,
             COALESCE(AVG(rr.rating),0) AS avgRating,
             COALESCE(MAX(ur.rating),0) AS userRating,
             GROUP_CONCAT(DISTINCT t.name) AS tags
      FROM recipes r
      LEFT JOIN recipeRatings rr ON r.recipeId = rr.recipeId
      LEFT JOIN recipeRatings ur ON r.recipeId = ur.recipeId AND ur.userId = ?
      LEFT JOIN recipetags rt ON r.recipeId = rt.recipeId
      LEFT JOIN tags t ON rt.tagId = t.tagId
      WHERE (r.category = ? OR r.category = 'Parve')
        ${dishType ? 'AND r.dishType = ?' : ''}
        ${excludeSQL}
      GROUP BY r.recipeId, r.title, r.category, r.dishType
      ORDER BY CASE
        WHEN MAX(ur.rating) > 0 THEN MAX(ur.rating)
        WHEN AVG(rr.rating) > 0 THEN AVG(rr.rating)
        ELSE 2.5
      END DESC
      LIMIT 10`;

        const params = [userId, preferredCategory];
        if (dishType) params.push(dishType);
        if (excludeIds.length) params.push(...excludeIds);

        const [rows] = await db.execute(mysql.format(sql, params));
        console.log(`Found ${rows.length} backups for category="${preferredCategory}", dishType="${dishType}".`);
        return rows.map(r => ({ ...r, recipeId: String(r.recipeId) }));
    } catch (error) {
        console.error('getBackupRecipesFromDb - DB error:', error);
        throw error;
    }
}

async function getIngredientsForMenusFromDb(menuIds) {
    try {
        if (!menuIds || menuIds.length === 0) return [];

        const db = await dbPromise;
        const placeholders = menuIds.map(() => '?').join(',');
        const sql = `
      SELECT DISTINCT i.name AS ingredientName
      FROM dailymenus dm
      JOIN menurecipes mr ON dm.menuId = mr.menuId
      JOIN RecipeIngredients ri ON mr.recipeId = ri.recipeId
      JOIN ingredients i ON ri.ingredientId = i.ingredientID
      WHERE dm.menuId IN (${placeholders})
      ORDER BY i.name`;
        const [rows] = await db.execute(sql, menuIds);
        return rows.map(row => ({ ingredientName: row.ingredientName }));
    } catch (error) {
        console.error('getIngredientsForMenusFromDb - DB error:', error);
        throw error;
    }
}

async function getMenuByUserId(userId) {
    try {
        const db = await dbPromise;
        const sql = `
      SELECT dm.menuId,
             dm.menuDate,
             GROUP_CONCAT(CONCAT(r.recipeId, ':', r.title) ORDER BY r.title SEPARATOR '; ') AS recipes
      FROM dailymenus dm
      LEFT JOIN menurecipes mr ON dm.menuId = mr.menuId
      LEFT JOIN recipes r ON mr.recipeId = r.recipeId
      WHERE dm.userId = ? AND dm.menuDate >= CURDATE()
      GROUP BY dm.menuId, dm.menuDate
      ORDER BY dm.menuDate ASC, dm.menuId ASC`;

        const [result] = await db.execute(mysql.format(sql, [userId]));
        console.log('UserId:', userId);
        console.log('Query result:', result);
        return result;
    } catch (error) {
        console.error('getMenuByUserId - DB error:', error);
        throw error;
    }
}

module.exports = {
    getRecipeDetailsFromDb,
    getBackupRecipesFromDb,
    getIngredientsForMenusFromDb,
    getMenuByUserId
};
