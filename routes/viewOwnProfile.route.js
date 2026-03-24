const express = require("express")
const Authentication = require("../Middleware/auth.middleware")
const viewProfile = require("../viewOwnProfile/viewProfile.viewOwnProfile")
const router= express.Router()
router.post("/viewOwnprofile",Authentication,viewProfile)

module.exports= router
