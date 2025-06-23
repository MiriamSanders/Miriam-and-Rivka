const genericService = require('../services/genericService');
const loginService = require('../services/loginService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerUser = async (userName, email, password) => {
    if (!userName || !password) {
        throw new Error('Username and password are required');
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = { userName: userName, email: email, userType: 1 }; // Default userType to 1 (regular user)

        const newUser = await genericService.genericPost('users', userData);
        if (!newUser) {
            throw new Error('User registration failed');
        }
        // Store the hashed password in the database
        await genericService.genericPost('passwords', { userId: newUser.userId, passwordHash: hashedPassword });
        //need to change- 
        let userType = await genericService.genericGet('roles', "roleId", newUser.userType);
        userType = userType[0];
        console.log(userType);
        // צור טוקן JWT
        const token = jwt.sign(
            { id: newUser.userId, userName: newUser.userName, userType: userType.roleName },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        return {
            token,
            user: {
                id: newUser.userId,
                userName: newUser.userName,
                userType: userType.roleName
            }
        };
    } catch (error) {
        throw new Error('Internal server error');
    }
}

exports.loginUser = async (userName, password) => {

    if (!userName || !password) {
        throw new Error('Username and password are required');
    }

    try {
        const user = await loginService.getUserWithPasswordByUserName(userName);

        if (!user) {
            throw new Error('Invalid username or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid username or password');
        }
        console.log(user);
        const token = jwt.sign(
            { id: user.userId, userName: user.userName, userType: user.roleName },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return {
            token,
            user: {
                id: user.userId,
                userName: user.userName,
                userType: user.roleName
            }
        };
    } catch (error) {
        throw new Error('Internal server error');
    }
};