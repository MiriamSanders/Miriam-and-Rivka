const mysql = require('mysql2/promise');
const dbPromise = require("./dbConnection"); 
async function articleGetAll(limit, offset) {
  try {
    const db = await dbPromise;
    let query = `SELECT a.articleId, u.userName,title FROM articles a
       JOIN users u ON a.authorId = u.userId`;
 const params = [];

    if (limit) {
      query += ` LIMIT ?`;
      params.push(limit);
    }
    if (offset) {
      query += ` OFFSET ?`;
      params.push(offset);
    }
    console.log(mysql.format(query, params));
    
    const [rows] = await db.execute(mysql.format(query, params));
  
    return rows;
  } catch (error) {
    console.error('Error fetching all data:', error);
    throw error;
  }
}

async function GenericPost(table, data) {
    try {
        const db = await dbPromise;
        const insertQuery = mysql.format(`INSERT INTO ?? SET ?`, [table, data]);
        const [insertResult] = await db.execute(insertQuery);
        console.log(data);

        let id = insertResult.insertId;
        if (id) {
            const selectQuery = mysql.format(`SELECT * FROM ?? WHERE userId = ?`, [table, id]);
            const [rows] = await db.execute(selectQuery);
            return rows[0] || null;
        } else if (data.userId) {
            const idQuery = mysql.format(`SELECT * FROM ?? WHERE userId = ?`, [table, data.userId]);
            const [rows] = await db.execute(idQuery);
            if (rows.length === 0) throw new Error('No record found for the given userID');
            return rows[0];
        } else {
            throw new Error('Insert did not return an ID, and userID was not provided.');
        }
    } catch (error) {
        console.error('Error inserting data:', error);
        throw error;
    }
}
async function getArticleById(id) {
    try {
        const db = await dbPromise;
        const query = `
            SELECT a.*, u.userName AS authorName
            FROM articles a
            JOIN users u ON a.authorId = u.userId
            WHERE a.articleId = ?
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
async function getArticlesByChefId(chefId) {
    try {
        const db = await dbPromise;
        const query = `
            SELECT a.articleId, a.title, a.content, u.userName AS authorName
            FROM articles a
            JOIN users u ON a.authorId = u.userId
            WHERE a.authorId = ?
        `;
        const [rows] = await db.execute(query, [chefId]);
        console.log("Articles by Chef ID:", rows);
        
        return rows;
    } catch (error) {
        console.error('Error fetching articles by chef ID:', error);
        throw error;
    }
}
module.exports = {
  articleGetAll,
  getArticleById,
  getArticlesByChefId,
};