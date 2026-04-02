
const sendPersonalMessage= require("../sendMessage/AboutMessage.sendMessge")
const Authentication= require("../Middleware/auth.middleware")
const express= require("express")
const Router= express.Router();
Router.post("/sendMessage",Authentication,sendPersonalMessage)

module.exports= Router