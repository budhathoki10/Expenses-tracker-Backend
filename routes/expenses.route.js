// importing the library and files
const ExpensesData = require("../Dashboard/expenses.Dashbaord");
const express = require("express");
const Authentication = require("../Middleware/auth.middleware");
const router = express.Router();
// create a post route for expense money
router.post("/ExpenseMoney", Authentication, ExpensesData);
module.exports = router;