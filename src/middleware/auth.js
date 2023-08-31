// middleware/auth.js
require("dotenv").config();
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;
const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).send("Access denied");
  }

  // Split the Authorization header to get the token part
  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).send("Access denied");
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).send("Your session is Expired please login again.");
  }
};

module.exports = authMiddleware;
