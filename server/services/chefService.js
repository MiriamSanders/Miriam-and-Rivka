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

module.exports = {
    getAllChefs,
    addChef
};