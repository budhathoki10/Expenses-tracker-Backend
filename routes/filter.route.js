const filterAggregation = require("../Aggregation/filter.aggregation.Piechart");
const filterAggregationBarchart = require("../Aggregation/filter.aggregation.Barchart");
const Authentication = require("../Middleware/auth.middleware");
const express = require("express");
const filterRoute = express.Router();
filterRoute.get("/filterPieChart", Authentication, filterAggregation);
filterRoute.get("/filterBarchart", Authentication, filterAggregationBarchart);
module.exports = filterRoute;