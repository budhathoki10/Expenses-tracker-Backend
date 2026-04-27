const Authentication = require("../Middleware/auth.middleware");
const SummaryData = require("../SummaryAI/SummaryAI");
const express = require("express");
const router = express.Router();
router.get("/summaryAI", Authentication, SummaryData);
module.exports = router;
