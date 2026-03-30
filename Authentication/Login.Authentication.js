const userModel = require("../Models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const findEmail = await userModel.findOne({ email: email });
    if (!findEmail) {
      return res.status(400).json({
        message: "this email is not registered yet",
      });
    }
    if(findEmail.OTP!=null){
 return res.status(400).json({
        message: "please verify your otp first",
      });
    }

    const checkPassword = await bcrypt.compare(
      password,
      findEmail.password || "",
    );
    if (!checkPassword) {
      return res.status(400).json({
        message: "Incorrect password",
      });
    }

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
    res
      .cookie("Cookie-token", token)
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
