const FilterData= require("../FIlterExpenses/filter.expenses")
const Authentication= require("../Middleware/auth.middleware")
const express= require("express")
const router = express.Router();
router.get("/filterExpenses", Authentication, FilterData);
module.exports = router;
