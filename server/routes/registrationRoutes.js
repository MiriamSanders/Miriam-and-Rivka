const express = require('express');
const router = express.Router();
const controller = require('../controllers/registrationController');


// Route to handle user registration
router.post('/register', controller.registerUser);
// Route to handle user login
router.post('/login', controller.loginUser);
// Route to handle user logout  
router.post('/logout', controller.logoutUser);
module.exports = router;

