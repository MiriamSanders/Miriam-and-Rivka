const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const e = require('express');

// Route to handle user registration
router.post('/register', registrationController.registerUser);
// Route to handle user login
router.post('/login', registrationController.loginUser);
// Route to handle user logout  
router.post('/logout', registrationController.logoutUser);
module.exports = router;

