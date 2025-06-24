const mysql = require('mysql2/promise');
const dbPromise = require('./dbConnection');
const genericService = require('./genericService');

async function getIngredientByName(ingredientName) {
 const result = await genericService.genericGet('ingredients', "name", ingredientName);
return result;
}
async function postIngredient(data) {
    const result = await genericService.genericPost('ingredients', data, 'ingredientId');
}
async function postRecipeIngredients(data) {
    const result = await genericService.genericPost('recipeIngredients', data, 'recipeId');
    return result;
}
module.exports = {
    getIngredientByName,
    postIngredient,
    postRecipeIngredients
}