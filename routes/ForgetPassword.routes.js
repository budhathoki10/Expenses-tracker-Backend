const express = require("express");
const ForgetPassword = require("../ForgetPassword/ForgetPassword");
const ChangePassword = require("../ForgetPassword/ChangePassword.forgetPassword");

const router = express.Router();
router.post("/forgetpassword",ForgetPassword)
router.post("/changepassword",ChangePassword)



module.exports= router
