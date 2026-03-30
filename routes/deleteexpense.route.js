const deleteExpense = require("../Dashboard/deleteexpense.Dashboard");
const express = require("express");
const Authentication = require("../Middleware/auth.middleware");
const router = express.Router();
router.delete("/deleteexpense/:id", Authentication, deleteExpense);
module.exports = router;
