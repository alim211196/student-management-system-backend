const mongoose = require("mongoose");
const validator = require("validator");
const userInfoSchema = mongoose.Schema({
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
  phone: {
    type: Number,
    min: 10,
    required: true,
  },
  profileImage: { type: String, default: null },
});

const UserInfo = new mongoose.model("UserInfo", userInfoSchema);

module.exports = UserInfo;
