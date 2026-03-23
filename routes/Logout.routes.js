const express= require("express")
const Logout = require("../SignOut/logout.SignOut")
const Authentication = require("../Middleware/auth.middleware")
const Router= express.Router()

Router.post("/logout",Authentication, Logout)

module.exports= Router