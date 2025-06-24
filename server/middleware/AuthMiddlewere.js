const jwt = require("jsonwebtoken");

function AuthMiddlewere(req, res, next) {
    const token = req.cookies.authToken;
    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        req.user = null;
        next();
    }
}

module.exports = AuthMiddlewere;
