const jwt = require('jsonwebtoken');


/* This auth middleware will be used to verify the token,
   retrieve user based on the token payload. */

module.exports = function(req, res, next) {
    const token = req.header('token');
    if (!token) {
        return res.status(401).json({ mag: 'Auth Error' });
    }
    try {
        const decoded = jwt.verify(token,"randomString");
        req.user = decoded.user;
        next();
    } catch (error) {
        console.error(error);
        res.status(500).send({ mag: "Invalid Token" })
    }
};