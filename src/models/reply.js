const mongoose = require("mongoose");
const validator = require("validator");
const replySchema = mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    validate(v) {
      if (!validator.isEmail(v)) {
        throw new Error("invalid Email");
      }
    },
  },
  course: {
    type: String,
    required: true,
  },
  courseYear: {
    type: String,
    required: true,
  },
  query: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  reply: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Reply = new mongoose.model("Reply", replySchema);

module.exports = Reply;
