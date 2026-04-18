const download = require("../DownloadReport/report.downloadReport");
const express = require("express");
const Authentication = require("../Middleware/auth.middleware");
const router = express.Router();

router.get("/download", Authentication, download);
module.exports = router;
