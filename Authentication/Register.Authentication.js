// importing all the libray and files
const userModel = require("../Models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validate = require("../Validation/register.validation");
const z = require("zod");

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
    
    // hasing the password for  user security
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      userName: userName,
      email: email,
      password: hashedPassword,
    });
    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        username: newUser.userName,
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

    return res
      .cookie("Cookie-token", token, cookieOptions)
      .status(200)
      .json({
        message: "User registered Sucessfully",
        token: token,
        user: {
          id: newUser._id,
          email: newUser.email,
          userName: newUser.userName,
        },
      });
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
