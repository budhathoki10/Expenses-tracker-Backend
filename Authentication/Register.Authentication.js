const userModel = require("../Models/user.model");
const express = require("express");
const app = express.Router();
const bcrypt = require("bcryptjs");
const userRegister = require("../Validation/user.validation");
const z = require("zod");
const generateOTP = require("../OTP/verifyOTP/generateOTP");
const sendEmail = require("../utils/nodemailer.utils");
const register = async (req, res) => {
  try {
    const parsedData = userRegister.parse(req.body);
    const { userName, email, password } = parsedData;
    const findEmail = await userModel.findOne({ email: email });
    if (findEmail) {
      return res.status(400).json({
        message: "this email is alredy registered",
      });
    }
    console.log("hello")
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      userName: userName,
      email: email,
      password: hashedPassword,
    });
    await newUser.save();
    generateOTP(email);
    const user = await userModel.findOne({ email: email });
    console.log("registered user is",user)
    console.log("registered user is",user.userName)
    console.log("registered user is",user.OTP)
   await  sendEmail(user.email,user)

    return res.status(200).json({ message: "User registered Sucessfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(500).json({
        status: "internal server error",
        errors: error.issues.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }
  }
};
module.exports = register;
