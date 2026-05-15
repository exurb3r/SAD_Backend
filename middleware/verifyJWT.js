const jwt = require('jsonwebtoken');

function verifyJWT(req, res, next) {
    const token = req.cookies?.token;
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403);
        req.user = decoded;
        next();
    });
}

module.exports = verifyJWT;