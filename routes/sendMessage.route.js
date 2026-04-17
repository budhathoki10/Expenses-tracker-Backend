
const sendPersonalMessage= require("../sendMessage/AboutMessage.sendMessge")
const Authentication= require("../Middleware/auth.middleware")
const express= require("express")
const Router= express.Router();
// create a post route for send messge

Router.post("/sendMessage",Authentication,sendPersonalMessage)

module.exports= Router