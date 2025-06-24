const mysql = require('mysql2/promise');
const dbPromise = require('./dbConnection');
const genericService = require('./genericService');

async function getAllChefs() {
  try {
    const db = await dbPromise;
    const query = `SELECT c.*, u.userName FROM chefs c JOIN users u ON c.chefId = u.userId`;
    const [rows] = await db.execute(mysql.format(query));
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
    return rows.length ? rows : null;
  } catch (error) {
    console.error('getFeaturedChefs - DB error:', error);
    throw error;
  }
}
async function getByUserId(userId) {
  const userData = await genericService.genericGetByColumnName('users', userId, 'userId');
  return userData;
}
async function postPendingRequest(data) {
  const result = await genericService.genericPost("pendingChefRequests", data, "chef_id");
  return result;
}
async function getByGuid(guid) {
  const result = await genericService.genericGetByColumnName('pendingChefRequests', guid, 'guid');
  return result;
}
async function deletePending(guid) {
  const result = await genericService.genericDelete('pendingChefRequests', guid, 'guid');
  return result;
}
module.exports = {
  getAllChefs,
  getChef,
  addChef,
  getFeaturedChefs,
  getByUserId,
  postPendingRequest,
  getByGuid,
  deletePending
};

