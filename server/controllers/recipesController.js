const GenericDA = require('../services/GenericDA');

exports.getAllRecipes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; 
    const offset = parseInt(req.query.offset) || 0;

    const recipes = await GenericDA.GenericGet('recipes', '1', '1', limit, offset);

    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'somthing went wrong' });
  }
};
