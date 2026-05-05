const updateExpense = require("../Dashboard/UpdateExpense.Dashboard");
const express = require("express");
const Authentication = require("../Middleware/auth.middleware");
const router = express.Router();
// create a put route for update expense and pass the id

router.put("/updateexpense/:id", Authentication, updateExpense);
module.exports = router;