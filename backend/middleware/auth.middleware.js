const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
    const token = req.headers["auth"];

    if(token === null) return res.json({success: false, message: "No token"});

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if(err) return res.json({success: false, message: err});

        req.username = user.username;
        req.userid = user.userid;
        next();
    });
};

module.exports = { authenticateToken };