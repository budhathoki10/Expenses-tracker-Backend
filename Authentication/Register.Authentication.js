const userModel = require("../Models/user.model");
const express = require("express");
const app = express.Router();
const bcrypt = require("bcryptjs");
const validate = require("../Validation/register.validation");
const z = require("zod");
const generateOTP = require("../OTP/verifyOTP/generateOTP");
const emailHandler = require("../EmailWiring/email.wiring");
// const sendEmail = require("../utils/nodemailer.utils");
const register = async (req, res) => {
  try {
    const parsedData = validate.parse(req.body);
    const { userName, email, password,conformpassword } = parsedData;
    const findEmail = await userModel.findOne({ email: email });
    if (findEmail) {
      return res.status(400).json({
        message: "this email is alredy registered",
      });
    }

    if(password!=conformpassword){
      return res.status(400).json({
        success:false,
        message:"Please enter the conform password same as password"
      })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      userName: userName,
      email: email,
      password: hashedPassword,
    });
    await newUser.save();
   await generateOTP(email);
    const user = await userModel.findOne({ email: email });
    // console.log("registered user is",user)
    // console.log("registered user is",user.userName)
    // console.log("registered user is",user.OTP)
  //  await  sendEmail(user.email,user)
  await emailHandler.sendOTP(user);

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
