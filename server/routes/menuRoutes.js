const express = require('express');
const router = express.Router();
const menuController = require('../controllers/MenuController');
router.post('/',menuController.createMealPlan);
router.get('/:id',menuController.getMenusByUserId);
module.exports = router;