const express = require("express");
const Authentication = require("../Middleware/auth.middleware");
const getMonthlySummary = require("../Dashboard/monthlySummary.dashboard");

const router = express.Router();

router.get("/monthlySummary", Authentication, getMonthlySummary);

module.exports = router;
