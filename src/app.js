require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const router = require("./router/Router");
const PORT = process.env.PORT
const bodyParser = require("body-parser");
const schedule = require("node-schedule");

const User = require("./models/user");
const Students = require("./models/students");

require("./db/conn");

app.use(express.json());
app.use(cors());
app.use(router);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Schedule the job to run daily at midnight
schedule.scheduleJob("0 0 * * *", async () => {
  const today = new Date();
  const users = await User.find();
  const students = await Students.find();

  users.forEach(async (user) => {
    if (
      user.dob.getMonth() === today.getMonth() &&
      user.dob.getDate() === today.getDate()
    ) {
      await User.findByIdAndUpdate(user._id, { isWished: false });
    }
  });

  students.forEach(async (student) => {
    if (
      student.dob.getMonth() === today.getMonth() &&
      student.dob.getDate() === today.getDate()
    ) {
      await Students.findByIdAndUpdate(student._id, { isWished: false });
    }
  });
});

app.listen(PORT);
