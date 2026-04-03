const filterAggregation = require("../Aggregation/filter.aggregation");
const Authentication = require("../Middleware/auth.middleware");
const express = require("express");
const filterRoute = express.Router();
filterRoute.get("/filter", Authentication, filterAggregation);
module.exports = filterRoute;