const Authentication = require("../Middleware/auth.middleware");
const ExpensesModel = require("../Models/expenses.models");
const userModel= require("../Models/user.model");
const DashbaordAI= require("../DashboardAI/DashboardAI");
const router= require("express").Router();

router.get("/dashboardAI",Authentication,DashbaordAI)
module.exports= router

