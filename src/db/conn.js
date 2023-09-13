require("dotenv").config();
const mongoose = require("mongoose");

// Use environment variable to get the MongoDB connection URL
const url = 
//  "mongodb://127.0.0.1:27017/studentManagementSystem";
process.env.MONGODB_URI ||
"mongodb+srv://mohdalim8180036208:DD0ZfIQr9Ty9MiSA@cluster0.yqgxdyd.mongodb.net/studentManagementSystem";

mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected Successfully to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

module.exports = mongoose.connection;
