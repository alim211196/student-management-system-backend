const mongoose = require("mongoose");
const attendanceSchema = mongoose.Schema(
  {
    attendance: {
      type: Array,
      required: true,
    },
    takenByTeacher_id: {
      type: String,
      required: true,
    },
    course: {
      type: String,
      required: true,
    },
    courseYear: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
    },
  },
  { strict: false }
);

const Attendance = new mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
