const OTPModel = require("../models/otp_model");
const nodemailer = require("nodemailer");
// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "mail.oxcytech.com",
  port: 465,
  auth: {
    user: "alim.mohd@oxcytech.com",
    pass: process.env.SMTP_PASSWORD,
  },
});

const generateOTP = () => {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

const insertOTP = async (email, otp) => {
  try {
    const otpData = {
      email,
      otp: otp.toString(),
    };
    await OTPModel.create(otpData);
    return true; // Indicate successful insertion
  } catch (error) {
    console.error("Error saving OTP:", error);
    return false; // Indicate failure
  }
};

const verifyOTP = async (email, otp) => {
  try {
    const storedOTP = await OTPModel.findOne({ email });
    if (storedOTP) {
      return storedOTP.otp === otp;
    } else {
      throw new Error("OTP not found for the given email");
    }
  } catch (error) {
    throw new Error("Failed to verify OTP");
  }
};

module.exports = {
  transporter,
  generateOTP,
  insertOTP,
  verifyOTP,
};
