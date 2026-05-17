const userModel = require("../../Models/user.model");
const jwt = require("jsonwebtoken");
const emailHandler = require("../../EmailWiring/email.wiring");
const verifyOTP = async (req, res) => {
try {
      const { email, otp } = req.body
      // console.log("hello")
      const findUser = await userModel.findOne({ email: email });
      if (!findUser) {
        return res.status(400).json({
          success: false,
          message: "invalid email",
        });
      }
      if (findUser.OTP != otp) {
        return res.status(400).json({
          success: false,
          message: "incorrect OTP please try again",
        });
      }
    
      if (Date.now() > findUser.OTPexpiryDate) {
        return res.status(400).json({
          success: false,
          message: "OTP expired, please register again",
        });
      }
    
      // Clear OTP after success
      findUser.OTP = null;
      findUser.OTPexpiryDate = null;
      await findUser.save();
    
      // return res.status(200).json({
      //   success: true,
      //   message: "OTP verified sucessfully",
      // });


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
          id: findUser._id,
          email: findUser.email,
          username: findUser.userName,
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

      res
        .cookie("Cookie-token", token, cookieOptions)
        .status(200)
        .json({
          message: "OTP verified successfully",
          token: token,
          user: {
            id: findUser._id,
            email: findUser.email,
            userName: findUser.userName,
          },
        });

} catch (error) {
     return res.status(500).json({
        success: false,
        message: "internal server errors",
      });
}
};

module.exports = verifyOTP;
