const verifyOTP = require("../OTP/verifyOTP/verify.otp");

const express= require("express")
router= express.Router();
router.post('/verify-otp',verifyOTP)

module.exports= router