const mongoose = require("mongoose");
const validator = require("validator");

const onlyForTeacher = (role) => {
  return role !== "admin";
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
    required: onlyForTeacher(this.role),
  },
  courseYear: {
    type: String,
    required: onlyForTeacher(this.role),
  },
  address: {
    type: String,
    required: onlyForTeacher(this.role),
  },
  city: {
    type: String,
    required: onlyForTeacher(this.role),
  },
  pinCode: {
    type: Number,
    required: onlyForTeacher(this.role),
    min: 6,
  },
  state: {
    type: String,
    required: onlyForTeacher(this.role),
  },
  country: {
    type: String,
    required: onlyForTeacher(this.role),
  },
  date: {
    type: Date,
    default: Date.now,
  },
  password: {
    type: String,
    required: onlyForTeacher(this.role),
    minlength: [8, "minimum 8 letters"],
  },
  role: {
    type: String,
    required: true,
  },
  active:{
    type: Boolean,
    required:true
  },
  profileImage: { type: String, default: null },
});

const User = new mongoose.model("User", UserSchema);

module.exports = User;
