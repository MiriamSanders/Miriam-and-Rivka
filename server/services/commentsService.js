const mysql = require('mysql2/promise');
const dbPromise = require("./dbConnection"); 
async function getRecipeComments(recipeId, limit, offset) {
  try {
    const db = await dbPromise;

    const query = `
      SELECT c.commentId, u.userName, c.commentText, c.userId 
      FROM comments c
      JOIN users u ON c.userId = u.userId
      WHERE c.recipeId = ?
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const [rows] = await db.execute(query, [recipeId]);
    return rows;

  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}
async function getArticleComments(articleId, limit, offset) {
  try {
    const db = await dbPromise;

    const query = `
      SELECT c.commentId, u.userName,c.userId, c.commentText
      FROM articlecomments c
      JOIN users u ON c.userId = u.userId
      WHERE c.articleId = ?
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const [rows] = await db.execute(query, [articleId]);
    return rows;

  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}
async function postRecipeComments(recipeId, userId, commentText) {
    try {
        const db = await dbPromise;

        const insertQuery = `
            INSERT INTO comments (recipeID, userId, commentText)
            VALUES (?, ?, ?)
        `;
        const [insertResult] = await db.execute(insertQuery, [recipeId, userId, commentText]);

        const insertedId = insertResult.insertId;

        if (!insertedId) {
            throw new Error('Comment insertion failed.');
        }


        return insertedId;
    } catch (error) {
        console.error('Comment insertion failed.', error);
        throw error;
    }
}
async function postArticleComments(articleId, userId, commentText) {
    try {
        const db = await dbPromise;

        const insertQuery = `
            INSERT INTO articlecomments (articleId, userId, commentText)
            VALUES (?, ?, ?)
        `;
        const [insertResult] = await db.execute(insertQuery, [articleId, userId, commentText]);

        const insertedId = insertResult.insertId;

        if (!insertedId) {
            throw new Error('Comment insertion failed.');
        }
        return insertedId;
    } catch (error) {
        console.error('Comment insertion failed.', error);
        throw error;
    }
}
async function deleteRecipeComment(commentId) {
   try{
  const db = await dbPromise;
    const query = `DELETE FROM comments WHERE commentId = ?`;

    const [result] = await db.execute(query, [commentId]);
    return result.affectedRows > 0;
  } catch (err) {
    console.error("Error deleting recipe comment:", err);
    return false;
  }
}
async function deleteArticleComment(commentId) {
try{
   const db = await dbPromise;
    const query = `DELETE FROM articlecomments WHERE commentId = ?`;
 
    const [result] = await db.execute(query, [commentId]);
    return result.affectedRows > 0;
  } catch (err) {
    console.error("Error deleting article comment:", err);
    return false;
  }
}
module.exports = {
 getRecipeComments,
 getArticleComments,
 postRecipeComments,
 postArticleComments,
 deleteRecipeComment,
 deleteArticleComment
};