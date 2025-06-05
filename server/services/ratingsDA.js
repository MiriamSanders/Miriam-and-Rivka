const mysql = require('mysql2/promise');
const dbPromise = require("./dbConnection"); 
async function getRatings(recipeId)
{
    const db=await dbPromise();
    const rating= await db.execute(`select avg(Rating) from reciperatings where RecipeID=?`,[recipeId]);
    console.log(rating); 
}