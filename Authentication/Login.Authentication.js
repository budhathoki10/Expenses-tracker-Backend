// importing all the library 
const userModel = require("../Models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// return true if the email and password are sucessfully true
const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // if email is not found it is unregistered
    const findEmail = await userModel.findOne({ email: email });
    if (!findEmail) {
      return res.status(400).json({
        message: "this email is not registered yet",
      });
    }
    // cehck if user verify the otp or not
    if(findEmail.OTP!=null){
 return res.status(400).json({
        message: "please verify your otp first",
      });
    }

    // check if the password is same as the database password or not
    const checkPassword = await bcrypt.compare(
      password,
      findEmail.password || "",
    );
    if (!checkPassword) {
      return res.status(400).json({
        message: "Incorrect password",
      });
    }

    // return the token and save into cookie if all good. token conrains id and emaik
    const token = jwt.sign(
      {
        id: findEmail._id,
        email: findEmail.email,
      },
      process.env.ACCESS_TOKEN_SECERET_KEY,
      {
        expiresIn: process.env.EXCESS_TOKEN_EXPIRE_IN,
      },
    );
    // retunr the proper message
    res
      .cookie("Cookie-token", token,{
          httpOnly: true,
  secure: false,   
  sameSite: "none",   // required for cross-origin cookies

      })
      .status(200)
      .json({ message: "user logged in sucessfully",
        token:token
      });
  } catch (error) {
     res
      .status(500)
      .json({
        sucess:false,
        message: "internal server error",
      });
  }
};
module.exports = Login;
