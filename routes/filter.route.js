// importing all the files and library
const filterAggregation = require("../Aggregation/filter.aggregation.Piechart");
const filterAggregationBarchart = require("../Aggregation/filter.aggregation.Barchart");
const Authentication = require("../Middleware/auth.middleware");
const express = require("express");
const filterRoute = express.Router();

// create a get route for both pie chart and bar chart

filterRoute.get("/filterPieChart", Authentication, filterAggregation);
filterRoute.get("/filterBarchart", Authentication, filterAggregationBarchart);
module.exports = filterRoute;