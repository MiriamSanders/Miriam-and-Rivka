const express = require('express');
const router = express.Router();
const Controller = require('../controllers/aproveChef');
router.post('/join-request', Controller.joinReq);
router.post('/chef/approve', Controller.apoveReq);
router.post('/chef/reject', Controller.rejectReq);
module.exports = router;