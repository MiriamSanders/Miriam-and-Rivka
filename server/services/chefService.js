const mysql = require('mysql2/promise');
const dbPromise = require('./dbConnection');

async function getAllChefs() {
  try {
    const db = await dbPromise;
    const query = `SELECT c.*, u.userName FROM chefs c JOIN users u ON c.chefId = u.userId`;
    const [rows] = await db.execute(mysql.format(query));
    console.log('Chefs fetched:', rows);
    return rows.length ? rows : null;
  } catch (error) {
    console.error('getAllChefs - DB error:', error);
    throw error;
  }
}

async function getChef(chefId) {
  try {
    const db = await dbPromise;
    const query = `
      SELECT c.*, u.userName 
      FROM chefs c 
      JOIN users u ON c.chefId = u.userId 
      WHERE c.chefId = ?
    `;
    const formattedQuery = mysql.format(query, [chefId]);
    const [rows] = await db.execute(formattedQuery);
    console.log('Chef fetched:', rows);
    return rows;
  } catch (error) {
    console.error('getChef - DB error:', error);
    throw error;
  }
}

async function addChef(chefData) {
  try {
    const db = await dbPromise;
    const updateQuery = `UPDATE users SET userType = 2 WHERE userId = ?`;
    await db.execute(mysql.format(updateQuery, [chefData.chefId]));

    const insertQuery = `INSERT INTO chefs (chefId, imageURL, education, experienceYears, style) VALUES (?, ?, ?, ?, ?)`;
    const params = [
      chefData.chefId,
      chefData.imageURL,
      chefData.education,
      chefData.experienceYears,
      chefData.style,
    ];
    const [result] = await db.execute(mysql.format(insertQuery, params));
    console.log('Chef added:', result);
    return result;
  } catch (error) {
    console.error('addChef - DB error:', error);
    throw error;
  }
}

async function getFeaturedChefs() {
  try {
    const db = await dbPromise;
    const query = `
      SELECT c.chefId, c.imageURL, u.userName
      FROM chefs c
      JOIN users u ON c.chefId = u.userId
      WHERE c.chefId IN (
        SELECT chefId FROM recipes GROUP BY chefId HAVING COUNT(*) > 4
      )
      LIMIT 6
    `;
    const [rows] = await db.execute(mysql.format(query));
    console.log('Featured chefs fetched:', rows);
    return rows.length ? rows : null;
  } catch (error) {
    console.error('getFeaturedChefs - DB error:', error);
    throw error;
  }
}

module.exports = {
  getAllChefs,
  getChef,
  addChef,
  getFeaturedChefs,
};

