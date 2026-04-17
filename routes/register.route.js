const express = require("express");
const router = express.Router();
const register = require("../Authentication/Register.Authentication");
// create a post route for register

router.post("/register", register);

module.exports = router;
