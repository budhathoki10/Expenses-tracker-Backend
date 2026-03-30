const express= require("express")
const Logout = require("../SignOut/logout.SignOut")
const Authentication = require("../Middleware/auth.middleware")
const LogoutRouters= express.Router()

LogoutRouters.post("/logout",Authentication, Logout)

module.exports= LogoutRouters