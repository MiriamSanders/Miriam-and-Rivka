const mysql = require('mysql2/promise');
const dbPromise = require('./dbConnection');
const genericService = require('./genericService');

async function getAdmin() {
    const admin = await genericService.genericGetByColumnName("users", 3, "userType");
    return admin;
}
module.exports = {
    getAdmin
}