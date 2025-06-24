const mysql = require('mysql2/promise');
const dbPromise = require("./dbConnection");
const genericService = require('./genericService');

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
  SELECT 
    c.commentId,
    u.userName,
    c.commentText,
    c.userId,
    r.commentText AS chefReplyText,
    r.userId AS chefUserId
  FROM articlecomments c
  JOIN users u ON c.userId = u.userId
  LEFT JOIN articleComments r ON r.parentCommentId = c.commentId
  WHERE c.articleId = ? AND c.parentCommentId IS NULL
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
async function getAllChefArticleComments(chefId, limit, offset) {
  try {
    const db = await dbPromise;
    const query = `
      SELECT 
        c.commentId,
        c.articleId,
        a.title AS articleTitle,
        u.userName,
        u.userId,
        c.commentText,
        chefReply.commentId AS chefReplyId,
        chefReply.commentText AS chefReplyText
      FROM articlecomments c
      JOIN articles a ON c.articleId = a.articleId
      JOIN users u ON c.userId = u.userId
      LEFT JOIN articlecomments chefReply 
        ON chefReply.parentCommentId = c.commentId AND chefReply.userId = a.authorId
      WHERE a.authorId = ? AND c.parentCommentId IS NULL
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
async function postRecipeComment(userId, recipeId, commentText, parentCommentId) {
  try {
    const db = await dbPromise;

    const insertQuery = `
      INSERT INTO recipecomments (recipeId, userId, commentText,parentCommentId)
      VALUES (?, ?, ?,?)
    `;
    const [insertResult] = await db.execute(insertQuery, [recipeId, userId, commentText, parentCommentId]);

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
async function postArticleComment(userId, articleId, commentText, parentCommentId) {
  try {
    const db = await dbPromise;

    const insertQuery = `
      INSERT INTO articlecomments (articleId, userId, commentText,parentCommentId)
      VALUES (?, ?, ?,?)
    `;
    const [insertResult] = await db.execute(insertQuery, [articleId, userId, commentText, parentCommentId]);

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
async function deleteArticleComment(commentId) {
  const result = await genericService.genericDelete('articlecomments', commentId, 'commentId');
  return result;
}
async function deleteRecipeComment(commentId) {
  const result = await genericService.genericDelete('recipecomments', commentId, 'commentId');
  return result;
}
module.exports = {
  getRecipeComments,
  getArticleComments,
  postArticleComment,
  postRecipeComment,
  getAllChefArticleComments,
  getAllChefRecipeComments,
  deleteArticleComment,
  deleteRecipeComment
};