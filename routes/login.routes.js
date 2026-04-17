const Login = require("../Authentication/Login.Authentication");
const express= require("express")
const router= express.Router()
// create a post route for login
router.post("/login",Login)

module.exports= router