const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/secrets.js');

module.exports = (req, res, next) => {

  try {
    const token = req.headers.authorization.split(" ")[1];

    if (token) {
      jwt.verify(token, jwtSecret, (err, decodedToken) => {
        if (err) {
          res.status(401).json({ message: "You shall not pass!" });
        } else {
          req.decodedJwt = decodedToken;
          // console.log(req.decodedJwt);
          next();
        }
      })
    } else {
      throw new Error('invalid auth data');
    }
  } catch (err) {
    res.status(401).json({ error: err.message });
  }

};