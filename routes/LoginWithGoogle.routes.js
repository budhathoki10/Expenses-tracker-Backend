const express = require("express");
const passport = require("passport");
const createPassword = require("../LoginWithGoogle/loginWithGoogle.password");
const Authentication = require("../Middleware/auth.middleware");
const jwt= require("jsonwebtoken")
const router = express.Router();


router.get(
  "/loginwithgoogle",
  passport.authenticate("google", { scope: ["profile", "email"] }) 
);

// router.get(
//  "/loginwithgoogle/callback",
//   passport.authenticate("google", { failureRedirect: "/" }),
//   (req, res) => {
//     res.status(200).json({Message:"login sucessfully"})
//   }
// );

router.get(
  "/loginwithgoogle/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    try {

      const token = jwt.sign(
        {
          id: req.user._id,
          email: req.user.email,
        },
        process.env.ACCESS_TOKEN_SECERET_KEY,
        {
          expiresIn: process.env.EXCESS_TOKEN_EXPIRE_IN,
        }
      );

      res
        .cookie("Cookie-token", token)
        .status(200)
        .json({
          message: "User logged in successfully",
          token: token,
        });

          return res.redirect("http://localhost:5173/dashboard");

    } catch (error) {
      res.status(500).json({ message: "Internal server error in google" });
    }
  }
);

router.post("/loginwithgoogle/createPassword",createPassword)
module.exports = router;    