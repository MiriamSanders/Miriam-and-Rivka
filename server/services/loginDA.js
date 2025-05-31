const mysql = require('mysql2/promise');
const dbPromise = require("./dbConnection"); 
async function getUserWithPasswordByUserName(username) {
    try {
        const db = await dbPromise;
        const query = `
            SELECT u.UserName,u.UserType, p.* 
            FROM users u
            JOIN passwords p ON u.UserID = p.UserID
            WHERE u.UserName = ?
        `;
        const [rows] = await db.execute(query, [username]);
        if (rows.length === 0) return null;
        // Remove Email field from result if present
         return rows[0];
    } catch (error) {
        console.error('Error joining user and password tables:', error);
        throw error;
    }
}
module.exports = {
    getUserWithPasswordByUserName
};