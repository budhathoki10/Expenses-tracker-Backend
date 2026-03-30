const updateExpense = require("../Dashboard/UpdateExpense.Dashboard");
const express = require("express");
const Authentication = require("../Middleware/auth.middleware");
const router = express.Router();
router.put("/updateexpense/:id", Authentication, updateExpense);
module.exports = router;