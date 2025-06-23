const express = require('express');
const router = express.Router();
const controller = require('../controllers/recipesController');

router.get('/',controller.getAllRecipes);
//change this
router.get('/best-rated', controller.getbestRatedRecipes);
router.get('/:id', controller.getRecipeById);
router.post('/', controller.createRecipe);
router.delete('/:id',async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to delete recipe" });
  }
controller.deleteRecipe(req,res);
})
router.put('/:id',async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Must be logged in to put recipe" });
  }
controller.putRecipe(req,res);
})
module.exports = router;