const mysql = require('mysql2/promise');
const dbPromise = require('./dbConnection');

async function getRatings(recipeId) {
    try {
        const db = await dbPromise;
        const [rows] = await db.execute(
            'SELECT AVG(rating) AS avgRating FROM reciperatings WHERE recipeId = ?',
            [recipeId]
        );
        if (!rows || rows.length === 0) return 0;
        const avgRating = rows[0].avgRating !== null ? parseFloat(rows[0].avgRating) : 0;
        return avgRating;
    } catch (error) {
        console.error('getRatings - DB error:', error);
        throw error;
    }
}

async function postRatings(recipeId, rating, userId) {
    try {
        const db = await dbPromise;
        const [existing] = await db.execute(
            'SELECT 1 FROM reciperatings WHERE recipeId = ? AND userId = ?',
            [recipeId, userId]
        );

        if (existing.length) {
            await db.execute(
                'UPDATE reciperatings SET rating = ? WHERE recipeId = ? AND userId = ?',
                [rating, recipeId, userId]
            );
        } else {
            await db.execute(
                'INSERT INTO reciperatings (recipeId, userId, rating, createdAt) VALUES (?, ?, ?, ?)',
                [recipeId, userId, rating, new Date()]
            );
        }
    } catch (error) {
        console.error('postRatings - DB error:', error);
        throw error;
    }
}

module.exports = {
    getRatings,
    postRatings
};
