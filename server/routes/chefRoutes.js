const express = require('express');
const router = express.Router();
const controller = require('../controllers/chefController');
router.post('/chef-application',
    async (req, res) => {
        try {
            const { chefId, imageURL, education, experienceYears, style, additionalInfo } = req.body;
            const result = await controller.joinReq(chefId, imageURL, education, experienceYears, style, additionalInfo);
            res.json(result);
        } catch (error) {
            console.error('Error processing chef application:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
router.get('/chef/approve/:guid', async (req, res) => {
    try {
        const guid = req.params.guid;
        const result = await controller.approveReq(guid);
        res.send(result);
    } catch (error) {
        console.error('Error approving chef request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/chef/reject/:guid', async (req, res) => {
    try {
        const guid = req.params.guid;
        const result = await controller.rejectReq(guid);
        res.send(result);
    } catch (error) {
        console.error('Error rejecting chef request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/chefs', async (req, res) => {
    try {
        const chefs = await controller.getAllChefs();
        res.json(chefs);
    } catch (error) {
        console.error('Error fetching chefs:', error);
        res.status(500).json({ error: 'something went wrong' });
    }
});
router.get('/chefs/featured-chefs', async (req, res) => {
    try {
        const result = await controller.getFeaturedChefs();
        res.json(result);
    } catch (error) {
        console.error('Error fetching featured chefs:', error);
        res.status(500).json({ error: 'something went wrong' });
    }
});
router.get('/chefs/:chefId', async (req, res) => {
    try {
        const chefId = req.params.chefId;
        const result = await controller.getChef(chefId);
        res.json(result);
    } catch (error) {
        console.error('Error fetching chef:', error);
        res.status(500).json({ error: 'something went wrong' });
    }
});
module.exports = router;