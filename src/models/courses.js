const mongoose = require("mongoose");

const courseSchema = mongoose.Schema({
  course: {
    type: Object,
    required: true,
    unique: true,
  },
  years: {
    type: Array,
    required: true,
    index: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    required: true,
  },
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
