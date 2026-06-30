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
    const secretKey =
      process.env.ACCESS_TOKEN_SECERET_KEY || process.env.ACCESS_TOKEN_SECRET_KEY;
    const expiresIn =
      process.env.EXCESS_TOKEN_EXPIRE_IN || process.env.ACCESS_TOKEN_EXPIRE_IN || "1d";

    if (!secretKey) {
      return res.status(500).json({
        success: false,
        message: "server misconfiguration: access token secret not set",
      });
    }

    const token = jwt.sign(
      {
        id: findEmail._id,
        email: findEmail.email,
        username: findEmail.userName,
      },
      secretKey,
      {
        expiresIn: expiresIn,
      },
    );
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    // retunr the proper message
    res
      .cookie("Cookie-token", token, cookieOptions)
      .status(200)
      .json({ message: "user logged in sucessfully",
        token:token,
        user: {
          id: findEmail._id,
          email: findEmail.email,
          userName: findEmail.userName,
        },
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
