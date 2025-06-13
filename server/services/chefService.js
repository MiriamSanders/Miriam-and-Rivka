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
module.exports = {
    getAllChefs
};