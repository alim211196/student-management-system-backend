const mongoose = require("mongoose");
const validator = require("validator");
const OTPSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    validate(v) {
      if (!validator.isEmail(v)) {
        throw new Error("invalid Email");
      }
    },
  },
  otp: {
    type: String,
  },
});

const OTPModel = new mongoose.model("OTPModel", OTPSchema);

module.exports = OTPModel;
