// utils/auth.js
require("dotenv").config();
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;
const generateToken=(user)=> {
  const payload = {
    userId: user._id,
    userType:user.role
  };

  const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });

  return token;
}

module.exports = generateToken;
