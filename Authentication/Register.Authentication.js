// importing all the libray and files
const userModel = require("../Models/user.model");
const express = require("express");
const app = express.Router();
const bcrypt = require("bcryptjs");
const validate = require("../Validation/register.validation");
const z = require("zod");
const generateOTP = require("../OTP/verifyOTP/generateOTP");
const emailHandler = require("../EmailWiring/email.wiring");

// register the user data in mongodb
const register = async (req, res) => {
  try {
    // check for field validation from zod
    const parsedData = validate.parse(req.body);
    const { userName, email, password,conformpassword } = parsedData;
    // check the email is register or not
    const findEmail = await userModel.findOne({ email: email });
    if (findEmail) {
      return res.status(400).json({
        message: "this email is alredy registered",
      });
    }
// check password
    if(password!=conformpassword){
      return res.status(400).json({
        success:false,
        message:"Please enter the conform password same as password"
      })
    }
    
    // hasing the password for  user security
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      userName: userName,
      email: email,
      password: hashedPassword,
    });
    await newUser.save();
   await generateOTP(email);
    const user = await userModel.findOne({ email: email });

  console.log("before send otp  to user")
  // send the otp to user email
  await emailHandler.sendOTP(user);

    return res.status(200).json({ message: "User registered Sucessfully" });
  } catch (error) {
    // display the message if it is from zod
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
