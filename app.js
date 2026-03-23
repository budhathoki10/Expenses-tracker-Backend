require('dotenv').config()

const express= require("express");
const mongoose= require("mongoose")
const app= express();
app.use(express.json())
const cookieParser= require('cookie-parser');
const register = require("./routes/register.route");
const verifyOTP= require("./routes/verifyOTP.route")
const login= require("./routes/login.routes")
const loginWithGoogle= require("./routes/LoginWithGoogle.routes")
const logout= require("./SignOut/logout.SignOut")
const passport= require("passport")
const session= require('express-session')
const googleStrategy= require("passport-google-oauth20").Strategy
app.use(cookieParser())

app.post("/",(req,res)=>{
    res.status(200).json("hello world");
})
mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
    console.log("Sucessfully connected to mongo db")
})
.catch((error)=>{
    console.log(error)
    console.log("Error in connecting a mongo db")
})

app.use(
    session({
        secret:"secret",
        resave:false,
        saveUninitialized:true
    })
)
app.use(passport.initialize())
app.use(passport.session())
app.use('/api',register)
app.use('/api',verifyOTP)
app.use('/api',login)
app.use('/api',loginWithGoogle)
app.use('/api',logout)

app.listen(5000,()=>{
    console.log(` http://localhost:5000`)
    console.log("server connected sucessfully")
})
