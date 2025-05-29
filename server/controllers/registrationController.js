const GenericDA = require('../services/GenericDA');
const loginDA = require('../services/loginDA');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = { UserName: username, Email: email, UserType: 'Regular' };

        const newUser = await GenericDA.GenericPost('users', userData);
        if (!newUser) {
            return res.status(400).json({ error: 'User registration failed' });
        }
        // Store the hashed password in the database
        await GenericDA.GenericPost('passwords', { UserID: newUser.UserID, PasswordHash: hashedPassword });
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const user = await loginDA.getUserWithPasswordByUserName(username);

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

     //   const token = jwt.sign({ id: user.UserID }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({id:user.UserID, username: user.UserName });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.logoutUser = (req, res) => {
    // Invalidate the token on the client side
    res.json({ message: 'Logged out successfully' });
}