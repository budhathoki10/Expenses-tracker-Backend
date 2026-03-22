const express = require("express");
const router = express.Router();
const register = require("../Authentication/Register.Authentication");
router.post("/register", register);

module.exports = router;
