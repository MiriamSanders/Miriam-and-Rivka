const mysql = require('mysql2/promise');
const genericService=require('./genericService');
const dbPromise = require("./dbConnection"); 
async function getAllArticles(limit, offset) {
  try {
    const db = await dbPromise;
    let query = `SELECT a.articleId, u.userName,title,a.authorId FROM articles a
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
async function updateArticle(id, title, content) {
  try {
    const db = await dbPromise;

    const updateQuery = `
      UPDATE articles 
      SET title = ?, content = ?
      WHERE articleId  = ?
    `;
    await db.execute(updateQuery, [title, content, id]);

    const [rows] = await db.execute(`SELECT * FROM articles WHERE articleId = ?`, [id]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error updating article:', error);
    throw error;
  }
}
async function  postArticle(data) {
  const articleResult=await genericService.genericPost("articles",data,"articleId");
      return articleResult;
}
async function deleteArticle(articleId) {
   const result= await genericService.genericDelete('articles', articleId, 'articleId');
      return result;
}
module.exports = {
 getAllArticles,
 getArticlesByChefId,
getArticleById,
  updateArticle,
  postArticle,
  deleteArticle
};