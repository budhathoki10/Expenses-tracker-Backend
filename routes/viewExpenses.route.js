const express = require("express")
const Authentication = require("../Middleware/auth.middleware")
const viewExpenses = require("../viewOwnWallet/viewExpenses")
const router= express.Router()
// create a post route for view expenses

router.post("/viewExpenses",Authentication,viewExpenses)


module.exports= router
