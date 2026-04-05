  const ExpensesModel = require("../Models/expenses.models");

  const barchartFilterAggregation = async (req, res) => {
    try {
      const now = new Date();
      const startDate = new Date(
        Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0),
      );
      const endDate = new Date(
        Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59, 999),
      );
    
  const result = await ExpensesModel.aggregate([
    {
      $match: {
        userID: req.user._id,
        type: "Expense",
        Date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { $month: "$Date" },
        total: { $sum: "$amount" }
      }
      
    },
    { $sort: { "_id": 1 } },   
    {
      $project: {
        _id: 0,                    
        month: {
          $arrayElemAt: [
            [                           
              "",                        
              "Jan", "Feb", "Mar",
              "Apr", "May", "Jun",
              "Jul", "Aug", "Sep",
              "Oct", "Nov", "Dec"
            ],
            "$_id"                     
          ]
        },
        total: 1                        
      }
    },
    { $sort: { "_id": 1 } }            
  ]); 

  return res.status(200).json({
    success: true,
    message:"Barchart data retrieved successfully",
    data: result
  });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
  module.exports = barchartFilterAggregation;
