const mongoose = require("mongoose");

const url = "mongodb://127.0.0.1:27017/studentManagementSystem";

mongoose
  .connect(url)
  .then(() => {
    console.log("Connected Successfully");
  })
  .catch((err) => {
    console.log(err);
    console.log("Disconnected");
  });


// const mongoose = require("mongoose");

// const uri =
//   "mongodb+srv://mohdalim8180036208:DD0ZfIQr9Ty9MiSA@cluster0.yqgxdyd.mongodb.net/studentManagementSystem";

// mongoose
//   .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => {
//     console.log("Connected Successfully");
//   })
//   .catch((err) => {
//     console.log(err);
//     console.log("Disconnected");
//   });