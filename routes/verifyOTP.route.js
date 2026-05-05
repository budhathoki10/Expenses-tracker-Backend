const verifyOTP = require("../OTP/verifyOTP/verify.otp");

const express= require("express")
router= express.Router();
// create a post route for verify otp

router.post('/verify-otp',verifyOTP)

module.exports= router