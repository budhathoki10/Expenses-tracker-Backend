const Login = require("../Authentication/Login.Authentication");

const express= require("express")
const router= express.Router()
router.post("/login",Login)

module.exports= router