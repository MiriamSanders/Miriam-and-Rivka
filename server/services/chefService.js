const mysql = require('mysql2/promise');
const dbPromise = require("./dbConnection"); 
 async function getAllChefs(){
    const db = await dbPromise;
    const query = `SELECT c.*,u.userName FROM chefs c JOIN users u ON c.chefId = u.userId `;
    const chefs= await db.execute(mysql.format(query));
    console.log("Chefs fetched:", chefs);
    if (chefs.length === 0) {
        return null;
    }
    return chefs[0];
}
async function getChef(chefId) {
  const db = await dbPromise;
  const query = `
    SELECT c.*, u.userName 
    FROM chefs c 
    JOIN users u ON c.chefId = u.userId 
    WHERE c.chefId = ?
  `;
  const formattedQuery = mysql.format(query, [chefId]);
  const [rows] = await db.execute(formattedQuery);
  console.log("Chef fetched:", rows);
  return rows;
}

async function addChef(chefData) {
    const db = await dbPromise;
    const query = `INSERT INTO chefs (chefId, imageURL, education, experienceYears, style) VALUES (?, ?, ?, ?, ?)`;
    const params = [chefData.chefId, chefData.imageURL, chefData.education, chefData.experienceYears, chefData.style];
    const updateQuery = `UPDATE users SET userType = 2 WHERE userId = ?`;
    const updateParams = [chefData.chefId];
    await db.execute(mysql.format(updateQuery, updateParams));
    const [result] = await db.execute(mysql.format(query, params));
    console.log("Chef added:", result);
    return result;
}
async function getFeaturedChefs()
{
  const db=await dbPromise;
  const query=`SELECT  c.chefId,c.imageURL,u.userName FROM chefs c JOIN users u ON c.chefId = u.userId WHERE c.chefId IN (SELECT chefId FROM recipes GROUP BY chefId HAVING count(*)>4) LIMIT 6`
  const chefs= await db.execute(mysql.format(query));
    console.log("Chefs fetched:", chefs);
    if (chefs.length === 0) {
        return null;
    }
    return chefs[0];
}
module.exports = {
    getAllChefs,
    addChef,
    getChef,
    getFeaturedChefs
};