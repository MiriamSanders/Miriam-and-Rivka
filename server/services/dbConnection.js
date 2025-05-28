const mysql = require("mysql2/promise");
require("dotenv").config({ path: "../.env" });

async function connect() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        // password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
    });

    console.log("Connected to MySQL database");
    return db;
}

module.exports = connect();