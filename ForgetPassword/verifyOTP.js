const userModel = require("../Models/user.model");
const verifyForgetPasswordOTP = async (req, res) => {
try {
      const { email, otp } = req.body

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
    
      return res.status(200).json({
        success: true,
        message: "OTP verified sucessfully",
      });


} catch (error) {
     return res.status(500).json({
        success: false,
        message: "internal server errors",
      });
}
};

module.exports = verifyForgetPasswordOTP;
