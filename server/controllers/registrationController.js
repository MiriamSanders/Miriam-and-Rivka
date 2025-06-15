const genericService= require('../services/genericService');
const loginService = require('../services/loginService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
    const { userName, email, password } = req.body;

    if (!userName || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = { userName: userName, email: email, userType: 1 }; // Default userType to 1 (regular user)

        const newUser = await genericService.genericPost('users', userData);
        if (!newUser) {
            return res.status(400).json({ error: 'User registration failed' });
        }
        // Store the hashed password in the database
        await genericService.genericPost('passwords', { userId: newUser.userId, passwordHash: hashedPassword });
        //need to change- 
        let userType=await genericService.genericGet('roles',"roleId", newUser.userType);
        userType=userType[0];
        console.log(userType);
        // צור טוקן JWT
        const token = jwt.sign(
            { id: newUser.userId, userName: newUser.userName, userType: userType.roleName },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // שלח אותו בקוקי
        res.cookie("authToken", token, {
            httpOnly: true,
            secure: false, // true בפרודקשן
            sameSite: "Lax",
            maxAge: 1000 * 60 * 60
        });
        res.status(201).json({ id: newUser.userId, userName: newUser.userName, userType: userType.roleName });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.loginUser = async (req, res) => {
    const { userName, password } = req.body;

    if (!userName || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const user = await loginService.getUserWithPasswordByUserName(userName);

        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        console.log(user);
        
        const token = jwt.sign(
            { id: user.userId, userName: user.userName, userType: user.roleName },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie("authToken", token, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
            maxAge: 1000 * 60 * 60 // שעה
        });

        res.status(200).json({ id: user.userId, userName: user.userName, userType: user.userType });


    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.logoutUser = (req, res) => {
    // Invalidate the token on the client side
    res.json({ message: 'Logged out successfully' });
}