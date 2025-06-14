const express = require('express');
const router = express.Router();
const Controller = require('../controllers/chefController');
router.post('/chef-application', Controller.joinReq);
 router.get('/chef/approve/:guid', Controller.approveReq);
 router.get('/chef/reject/guid', Controller.rejectReq);
router.get('/chefs', Controller.getAllChefs);
module.exports = router;