const mongoose = require("mongoose");
const validator = require("validator");

const postUserSchema = mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: [true, "Email address already present"],
    validate(v) {
      if (!validator.isEmail(v)) {
        throw new Error("invalid Email");
      }
    },
  },
  phone: {
    type: Number,
    min: 10,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: [8, "minimum 8 letters"],
  },
  profileImage: { type: String, default: null },
  date: {
    type: Date,
    default: Date.now,
  },
});

const PostUser = mongoose.model("PostUser", postUserSchema);

module.exports = PostUser;
