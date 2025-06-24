const express = require('express');
const router = express.Router();
const controller = require('../controllers/registrationController');

// Route to handle user registration
router.post('/register', async (req, res) => {
    try {
        const { userName, email, password } = req.body;
        const result = await controller.registerUser(userName, email, password);
        res.cookie("authToken", result.token, {
            httpOnly: true,
            secure: false, // true בפרודקשן
            sameSite: "Lax",
            maxAge: 1000 * 60 * 60
        });

        res.status(201).json(result.user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Route to handle user login
router.post('/login', async (req, res) => {
    try {
        const { userName, password } = req.body;
        const result = await controller.loginUser(userName, password);
        res.cookie("authToken", result.token, {
            httpOnly: true,
            secure: false, // true בפרודקשן
            sameSite: "Lax",
            maxAge: 1000 * 60 * 60
        });
        res.status(200).json(result.user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Route to handle user logout
router.post('/logout', async (req, res) => {
    try {
        res.clearCookie("authToken");
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/forgot-password', async (req, res) => {
    try {
        const { userName } = req.body;
        const result = await controller.forgotPasswordByUsername(userName);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const result = await controller.resetPassword(token, password);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

