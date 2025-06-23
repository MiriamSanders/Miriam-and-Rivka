const {pairMealsForWeek}= require('./menuPlaner');
const mealPlanService= require('../services/mealPlanService')
exports.createMealPlan = async (userId,sideIds,mainIds, dessertIds) => {
  try {
const sidesArray = typeof sideIds === 'string' ? sideIds.split(',').map(id => id.trim()) : Array.isArray(sideIds) ? sideIds : [];
const mainsArray = typeof mainIds === 'string' ? mainIds.split(',').map(id => id.trim()) : Array.isArray(mainIds) ? mainIds : [];
const dessertsArray = typeof dessertIds === 'string' ? dessertIds.split(',').map(id => id.trim()) : Array.isArray(dessertIds) ? dessertIds : [];
console.log('sidesArray:', sidesArray);
console.log('mainsArray:', mainsArray);
console.log('dessertsArray:', dessertsArray);

const menu = await pairMealsForWeek(sidesArray, mainsArray, dessertsArray,userId);
    return { menu };
}
catch (error) {
    throw new Error('Something went wrong while creating the meal plan');
  } 
}
exports.getMenusByUserId= async(userId)=>{
  try{
    const result =await mealPlanService.getMenuByUserId(userId);
    return result;
  }
  catch(error){
    throw new Error("unable to fetch menus");
  }
}
