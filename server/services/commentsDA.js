const mysql = require('mysql2/promise');
const dbPromise = require("./dbConnection"); 
async function GetRecipeComments(recipeId, limit, offset) {
  try {
    const db = await dbPromise;

    const query = `
      SELECT c.CommentID, u.UserName, c.CommentText
      FROM comments c
      JOIN Users u ON c.UserID = u.UserID
      WHERE c.RecipeID = ?
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
async function GetArticleComments(ArticleId, limit, offset) {
  try {
    const db = await dbPromise;

    const query = `
      SELECT c.CommentID, u.UserName, c.CommentText
      FROM articlecomments c
      JOIN Users u ON c.UserID = u.UserID
      WHERE c.ArticleID = ?
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const [rows] = await db.execute(query, [ArticleId]);
    return rows;

  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}
async function postRecipeComments(recipeId, userID, commentText) {
    try {
        const db = await dbPromise;

        const insertQuery = `
            INSERT INTO Comments (RecipeID, UserID, CommentText)
            VALUES (?, ?, ?)
        `;
        const [insertResult] = await db.execute(insertQuery, [recipeId, userID, commentText]);

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
async function postArticleComments(ArticleId, userID, commentText) {
    try {
        const db = await dbPromise;

        const insertQuery = `
            INSERT INTO articlecomments (ArticleID, UserID, CommentText)
            VALUES (?, ?, ?)
        `;
        const [insertResult] = await db.execute(insertQuery, [ArticleId, userID, commentText]);

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

module.exports = {
 GetRecipeComments,
 GetArticleComments,
 postRecipeComments,
 postArticleComments
};