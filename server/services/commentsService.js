const mysql = require('mysql2/promise');
const dbPromise = require("./dbConnection"); 
async function getRecipeComments(recipeId, limit, offset) {
  try {
    const db = await dbPromise;

  const query = `
  SELECT 
    c.commentId,
    u.userName,
    c.commentText,
    c.userId,
    r.commentText AS chefReplyText,
    r.userId AS chefUserId
  FROM recipecomments c
  JOIN users u ON c.userId = u.userId
  LEFT JOIN recipeComments r ON r.parentCommentId = c.commentId
  WHERE c.recipeId = ? AND c.parentCommentId IS NULL
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
            INSERT INTO recipecomments (recipeID, userId, commentText)
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
    const query = `DELETE FROM recipecomments WHERE commentId = ?`;

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
async function getAllChefRecipeComments(chefId, limit, offset) {
  try {
    const db = await dbPromise;
      const query = `
      SELECT 
        c.commentId,
        c.recipeId,
        r.title AS recipeTitle,
        u.userName,
        u.userId,
        c.commentText,
        chefReply.commentId AS chefReplyId,
        chefReply.commentText AS chefReplyText
      FROM recipecomments c
      JOIN recipes r ON c.recipeId = r.recipeId
      JOIN users u ON c.userId = u.userId
      LEFT JOIN recipecomments chefReply 
        ON chefReply.parentCommentId = c.commentId AND chefReply.userId = r.chefId
      WHERE r.chefId = ? AND c.parentCommentId IS NULL
      LIMIT ${limit}
      OFFSET ${offset}
    `;


    const [rows] = await db.execute(query, [chefId]);
    return rows;

  } catch (error) {
    console.error('Error fetching chef comments:', error);
    throw error;
  }
}
async function postChefRecipeComment(userId, recipeId, commentText,parentCommentId) {
  try {
    const db = await dbPromise;

    const insertQuery = `
      INSERT INTO recipecomments (recipeId, userId, commentText,parentCommentId)
      VALUES (?, ?, ?,?)
    `;
    const [insertResult] = await db.execute(insertQuery, [recipeId, userId, commentText,parentCommentId]);

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
 getRecipeComments,
 getArticleComments,
 postRecipeComments,
 postArticleComments,
 deleteRecipeComment,
 deleteArticleComment,
 getAllChefRecipeComments,
 postChefRecipeComment
};