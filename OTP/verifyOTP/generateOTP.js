const userModel = require("../../Models/user.model");
const generateOTP = async (email) => {
  const findUser = await userModel.findOne({ email: email });
  if (!findUser) {
    throw new Error("User not found");
  }
  otp = Math.floor(100000 + Math.random() * 900000).toString();
  findUser.OTP = otp;
  findUser.OTPexpiryDate = Date.now() + 60 * 60 * 1000;

  await findUser.save();
};
module.exports = generateOTP;
