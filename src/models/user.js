const mongoose = require("mongoose");
const validator = require("validator");

const onlyForTeacher = (role) => {
  return role !== "admin";
};

const adminValidator = function (value) {
  return onlyForTeacher(this.role) || value;
};

const UserSchema = mongoose.Schema({
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
  course: {
    type: String,
    validate: adminValidator,
  },
  courseYear: {
    type: String,
    validate: adminValidator,
  },
  address: {
    type: String,
    validate: adminValidator,
  },
  city: {
    type: String,
    validate: adminValidator,
  },
  pinCode: {
    type: Number,
    validate: adminValidator,
    min: 6,
  },
  state: {
    type: String,
    validate: adminValidator,
  },
  country: {
    type: String,
    validate: adminValidator,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  password: {
    type: String,
    required: adminValidator,
    minlength: [8, "minimum 8 letters"],
  },
  role: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
  profileImage: { type: String, default: null },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
