const mysql = require('mysql2/promise');
const dbPromise = require('./dbConnection');
const genericService = require('./genericService'); 
 
async function getAlltags() {
     const tags = await genericService.genericGetAll('tags');
        return tags;
}
async function postTag(data) {
    tag = await genericService.genericPost('tags', data, 'tagId');
    return tag;
}
async function getTagByName(tagName) {
    const tag=await genericService.genericGet('tags', 'name', tagName);
    return tag;
}
async function postRecipeTags(data) {
    const recipeTag= await genericService.genericPost('recipeTags',data, 'recipeId');
    return recipeTag;
}
async function getRecipeTags(recipeId) {
   const tags = await genericService.genericGet('recipeTags', 'recipeId', recipeId); 
   return tags;
}
module.exports={
    getAlltags,
    postTag,
    getTagByName,
    postRecipeTags,
    getRecipeTags
}