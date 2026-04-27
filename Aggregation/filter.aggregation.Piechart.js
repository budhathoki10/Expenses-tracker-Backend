// importing the ExpenseModel
const ExpensesModel = require("../Models/expenses.models");
const Aggregation = require("./Aggregation");
// return the data of expense according to weekly,monthy and yearly
const filterAggregation = async (req, res) => {
  // query parameter like weekly,monthly,yearly
  try {
    const { filter } = req.query;
    if (!filter) {
      return res.status(400).json({
        success: false,
        message: "Filter query parameter is required",
      });
    }
    const filteredData = await Aggregation(req, res, filter);

      return res.status(200).json({
      success: true,
      data: filteredData
    }); 

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

module.exports = filterAggregation;
