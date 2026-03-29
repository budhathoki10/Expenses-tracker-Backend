require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");

const register = require("./routes/register.route");
const verifyOTP = require("./routes/verifyOTP.route");
const login = require("./routes/login.routes");
const loginWithGoogle = require("./routes/LoginWithGoogle.routes");
const logout = require("./SignOut/logout.SignOut");
const configureGoogleAuth = require("./LoginWithGoogle/google.loginWithGoogle"); 
const viewOwnProfile= require("./routes/viewOwnProfile.route")
const expensesMoney = require("./routes/expenses.route")

const app = express();
app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Successfully connected to MongoDB"))
  .catch((error) => console.log("Error connecting to MongoDB:", error));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret", 
    resave: false,
    saveUninitialized: false,                       
  })
);

app.use(passport.initialize());
app.use(passport.session());

configureGoogleAuth();

app.use("/api", register);
app.use("/api", verifyOTP);
app.use("/api", login);
app.use("/api", loginWithGoogle);
app.use("/api", viewOwnProfile);
app.use("/api", expensesMoney);

app.use("/api", logout);


app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});