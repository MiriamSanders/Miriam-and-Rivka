const express = require('express');
const router = express.Router();
const menuController = require('../controllers/MenuController');
router.post('/', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const { userId, sideIds, mainIds, dessertIds } = req.body;
        const menu = await menuController.createMealPlan(userId, sideIds, mainIds, dessertIds);
        res.status(201).json(menu);
    } catch (error) {
        console.error('Error creating meal plan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const menus = await menuController.getMenusByUserId(userId);
        res.status(200).json(menus);
    } catch (error) {
        console.error('Error fetching menus:', error);
        res.status(500).json({ error: 'Unable to fetch menus' });
    }
});
module.exports = router;