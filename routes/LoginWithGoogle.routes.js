const express= require("express")
const LoginWithgoogle = require("../LoginWithGoogle/google.loginWithGoogle")

const router= express.Router()
router.post("/loginwithgoogle",LoginWithgoogle)
module.exports= router