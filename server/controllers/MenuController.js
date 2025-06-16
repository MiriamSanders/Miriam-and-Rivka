const {pairMealsForWeek}= require('../models/MealPlanner');
exports.createMealPlan = async (req, res) => {
  try {
  const {userId,sideIds,mainIds, dessertIds} = req.body;
const sidesArray = typeof sideIds === 'string' ? sideIds.split(',').map(id => id.trim()) : Array.isArray(sideIds) ? sideIds : [];
const mainsArray = typeof mainIds === 'string' ? mainIds.split(',').map(id => id.trim()) : Array.isArray(mainIds) ? mainIds : [];
const dessertsArray = typeof dessertIds === 'string' ? dessertIds.split(',').map(id => id.trim()) : Array.isArray(dessertIds) ? dessertIds : [];
console.log('sidesArray:', sidesArray);
console.log('mainsArray:', mainsArray);
console.log('dessertsArray:', dessertsArray);

const menu = await pairMealsForWeek(sidesArray, mainsArray, dessertsArray,userId);
    res.status(200).json({ menu });
}
catch (error) {
    console.error('Error creating meal plan:', error);
    res.status(500).json({ error: 'Something went wrong while creating the meal plan' });
  } 
}