const mysql = require('mysql2/promise');
const dbPromise = require("./dbConnection"); 
async function getRatings(recipeId)
{
    const db=await dbPromise;
    const rating= await db.execute(`select avg(rating) from reciperatings where recipeId=?`,[recipeId]);
    console.log(rating); 
    if (!rating || !rating[0] || rating[0].length === 0) {
        return 0;
    }
    // Ensure avgRating is a number
    const avg = rating[0][0]['avg(rating)'];
    const avgRating = avg !== null ? parseFloat(avg) : 0;
    return avgRating;
    //return rating; // Return average rating or 0 if no ratings exist
}
async function postRatings(recipeId, rating, userId) {
    const db = await dbPromise;
    // Check if the user has already rated this recipe
    const [existingRating] = await db.execute(
        `SELECT * FROM reciperatings WHERE recipeId = ? AND userId = ?`,
        [recipeId, userId]
    );

    if (existingRating.length > 0) {
        // Update existing rating
        await db.execute(
            `UPDATE reciperatings SET rating = ? WHERE recipeID = ? AND userId = ?`,
            [rating, recipeId, userId]
        );
    } else {
        // Insert new rating
        await db.execute(
            `INSERT INTO reciperatings (recipeId, userId, rating,createdAt) VALUES (?, ?, ?,?)`,
            [recipeId, userId, rating,new Date()]
        );
    }
}
module.exports = {
    getRatings,
    postRatings
};  