const express = require('express');
const router = express.Router();
const Controller = require('../controllers/chefController');
// router.post('/join-request', Controller.joinReq);
// router.post('/chef/approve', Controller.apoveReq);
// router.post('/chef/reject', Controller.rejectReq);
router.get('/chefs', Controller.getAllChefs);
module.exports = router;