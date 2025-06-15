const express = require('express');
const router = express.Router();
const controller = require('../controllers/chefController');
router.post('/chef-application', controller.joinReq);
 router.get('/chef/approve/:guid', controller.approveReq);
 router.get('/chef/reject/guid', controller.rejectReq);
router.get('/chefs', controller.getAllChefs);
router.get('/chefs/:chefId', controller.getChef);
module.exports = router;