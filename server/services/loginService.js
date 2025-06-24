const mysql = require('mysql2/promise');
const dbPromise = require("./dbConnection"); 
async function getUserWithPasswordByUserName(username) {
    try {
        const db = await dbPromise;
        const query = `
            SELECT u.userName,r.roleName, p.* 
            FROM users u
            JOIN passwords p ON u.userId = p.userId
            JOIN roles r ON r.roleId = u.userType
            WHERE u.userName = ?
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
async function getUserWithEmailByUserName(userName) {
    const db = await dbPromise;
    const [rows] = await db.execute(
        `SELECT userId, userName, email FROM users WHERE userName = ?`,
        [userName]
    );
    return rows[0];
};
module.exports = {
    getUserWithPasswordByUserName,
    getUserWithEmailByUserName
};