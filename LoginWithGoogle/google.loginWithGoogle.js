const userModel = require("../Models/user.model");
const passport= require("passport")
const session= require('express-session')
const googleStrategy= require("passport-google-oauth20").Strategy

const LoginWithgoogle= async(req,res)=>{

passport.use(googleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:"http://localhost:5000/auth/google/callback"
},
))



}

module.exports= LoginWithgoogle
