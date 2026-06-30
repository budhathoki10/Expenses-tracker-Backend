const express = require("express");
const passport = require("passport");
const Authentication = require("../Middleware/auth.middleware");
const jwt= require("jsonwebtoken")
const router = express.Router();

const getFrontendUrl = () =>
  (process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    "https://expensetracker-azure-two.vercel.app").replace(/\/$/, "");


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
        process.env.ACCESS_TOKEN_SECERET_KEY || process.env.ACCESS_TOKEN_SECRET_KEY,
        {
          expiresIn: process.env.EXCESS_TOKEN_EXPIRE_IN || process.env.ACCESS_TOKEN_EXPIRE_IN || "1d",
        }
      );

      res.cookie("Cookie-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });

      return res.redirect(`${getFrontendUrl()}/dashboard?token=${token}`);
    } catch (error) {
      res.status(500).json({ message: "Internal server error in google" });
    }
  }
);

module.exports = router;
