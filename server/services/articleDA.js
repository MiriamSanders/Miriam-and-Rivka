const mysql = require('mysql2/promise');
const dbPromise = require("./dbConnection"); 

async function getArticleById(id) {
    try {
        const db = await dbPromise;
        const query = `
            SELECT a.*, u.UserName AS AuthorName
            FROM articles a
            JOIN users u ON a.AuthorID = u.UserID
            WHERE a.ArticleID = ?
        `;
        const [rows] = await db.execute(query, [id]);
        if (rows.length === 0) return null;
        console.log(rows);
        
        return rows[0];
    } catch (error) {
        console.error('Error fetching article by ID:', error);
        throw error;
    }
    
}
module.exports = {
    getArticleById
};
