const express = require('express');
const router = express.Router();
const menuController = require('../controllers/MenuController');
router.post('/meal-plan',menuController.createMealPlan);
module.exports = router;