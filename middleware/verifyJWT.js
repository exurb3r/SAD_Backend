const jwt = require('jsonwebtoken');

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.sendStatus(401);

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        console.log("SECRET:", process.env.ACCESS_TOKEN_SECRET); 
        console.log("ERROR:", err?.message);                      
        console.log("DECODED:", decoded);
        if (err) return res.sendStatus(403);
        req.user = decoded;
        next();
    });
}

module.exports = verifyJWT;
