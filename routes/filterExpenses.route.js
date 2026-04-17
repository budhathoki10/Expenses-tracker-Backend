const FilterData= require("../FIlterExpenses/filter.expenses")
const Authentication= require("../Middleware/auth.middleware")
const express= require("express")
const router = express.Router();
// create a get route for expense money
router.get("/filterExpenses", Authentication, FilterData);
module.exports = router;
