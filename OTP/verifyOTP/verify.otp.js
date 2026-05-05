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


          const token = jwt.sign(
            {
              id: findUser._id,
              email: findUser.email,
              username: findUser.userName,
            },
            process.env.ACCESS_TOKEN_SECERET_KEY,
            {
              expiresIn: process.env.EXCESS_TOKEN_EXPIRE_IN,
            },
          );
          res
            .cookie("Cookie-token", token,{
                httpOnly: true,
        secure: false,   
        sameSite: "none",   
      
            })
            .status(200)
            .json({ 
              message: "OTP verified sucessfully",
              token:token
            });

} catch (error) {
     return res.status(500).json({
        success: false,
        message: "internal server errors",
      });
}
};

module.exports = verifyOTP;
