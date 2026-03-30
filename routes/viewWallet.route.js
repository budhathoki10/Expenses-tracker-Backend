const express = require("express")
const Authentication = require("../Middleware/auth.middleware")
const viewWallet = require("../viewOwnWallet/viewWallet.wallet")
const router= express.Router()
router.post("/viewOwnwallet",Authentication,viewWallet)

module.exports= router
