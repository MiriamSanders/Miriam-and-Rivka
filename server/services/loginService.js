const mysql = require('mysql2/promise');
const dbPromise = require("./dbConnection");
const genericService = require('./genericService');
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
async function postUser(data) {
    const newUser = await genericService.genericPost('users', data);
    return newUser;
}
async function postPassword(data) {
    const password = await genericService.genericPost('passwords', data);
    return password;
}
async function getRole(userType) {
    let userTypeName = await genericService.genericGet('roles', "roleId", userType);
    return userTypeName[0];

}
async function getUserById(userId) {
    const user = await genericService.genericGetByColumnName('users', userId, "userId");
    return user;
}
async function updatePassword(userId,data) {
    const update = await genericService.genericPut("passwords", userId, data);
    return update;
}
module.exports = {
    getUserWithPasswordByUserName,
    getUserWithEmailByUserName,
    postUser,
    postPassword,
    getRole,
    getUserById,
    updatePassword

};