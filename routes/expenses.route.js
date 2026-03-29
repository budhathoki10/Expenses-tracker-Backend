const ExpensesData = require("../Dashboard/expenses.Dashbaord");
const express = require("express");
const Authentication = require("../Middleware/auth.middleware");
const router = express.Router();
router.post("/ExpenseMoney", Authentication, ExpensesData);
module.exports = router;