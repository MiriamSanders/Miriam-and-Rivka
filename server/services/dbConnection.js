const mysql = require("mysql2/promise");
require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });

async function connect() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,

        // Pool configuration
        connectionLimit: 10,

        queueLimit: 0
    });

    // Test the pool
    try {
        const connection = await pool.getConnection();
        connection.release();
    } catch (error) {
        console.error("Error connecting to MySQL:", error);
        throw error;
    }

    // Return the pool (which has the same execute method as a single connection)
    return pool;
}
module.exports = connect();