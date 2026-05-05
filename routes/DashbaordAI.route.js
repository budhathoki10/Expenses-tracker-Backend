const Authentication = require("../Middleware/auth.middleware");
const ExpensesModel = require("../Models/expenses.models");
const userModel= require("../Models/user.model");
const DashbaordAI= require("../DashboardAI/DashboardAI");
const router= require("express").Router();

// Accept both GET (query param) and POST (body) for compatibility with clients
router.route("/dashboardAI").get(Authentication, DashbaordAI).post(Authentication, DashbaordAI)
module.exports= router

