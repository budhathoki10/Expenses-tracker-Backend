const express = require("express");
const ForgetPassword = require("../ForgetPassword/Forgetpassword");
const ChangePassword = require("../ForgetPassword/ChangePassword.forgetPassword");
const verifyForgetPasswordOTP = require("../ForgetPassword/verifyOTP");

const router = express.Router();
router.post("/forgetpassword",ForgetPassword)
router.post("/forgetpasswordOTP",verifyForgetPasswordOTP)
router.post("/changepassword",ChangePassword)



module.exports= router
