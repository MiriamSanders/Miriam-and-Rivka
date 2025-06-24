
const loginService = require('../services/loginService');
const { resetPasswordEmail } = require('./emailHandler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerUser = async (userName, email, password) => {
    if (!userName || !password) {
        throw new Error('Username and password are required');
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = { userName: userName, email: email, userType: 1 }; 

        const newUser = await loginService.postUser(userData);
        if (!newUser) {
            throw new Error('User registration failed');
        }
        // Store the hashed password in the database
        await loginService.postPassword({ userId: newUser.userId, passwordHash: hashedPassword });
        //need to change- 
        let userType = await loginService.getRole(newUser.userType);
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

// Add this function
exports.forgotPasswordByUsername = async (username) => {
    const user = await loginService.getUserWithEmailByUserName(username);
    if (!user) throw new Error("Username not found");

    // Generate a token
    const resetToken = jwt.sign({ id: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send email
    await resetPasswordEmail(user.email, resetToken);
    return { message: "email sent succsesfuly" };


};
exports.resetPassword = async (token, newPassword) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const user = await loginService.getUserById(userId);
        if (!user) throw new Error('User not found');


        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await loginService.updatePassword(userId,{ userId: userId, passwordHash: hashedPassword });
      

        return { message: 'Password reset successful' };
    } catch (err) {
        throw new Error('Invalid or expired token');
    }
};
