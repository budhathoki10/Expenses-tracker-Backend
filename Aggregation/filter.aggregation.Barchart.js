const ExpensesModel = require("../Models/expenses.models");

const barchartFilterAggregation = async (req, res) => {
  try {

    const now = new Date();
    const dayOfWeek = now.getDay(); 
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const result = await ExpensesModel.aggregate([
      {
        $match: {
          userID: req.user._id,
          type: { $in: ["Income", "Expense"] }, 
          Date: { $gte: startOfWeek, $lte: endOfWeek },
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfWeek: "$Date" }, 
            type: "$type",              
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.day": 1 } },
      {
        $project: {
          _id: 0,
          day: {
            $arrayElemAt: [
              ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
              { $subtract: ["$_id.day", 1] },
            ],
          },
          type: "$_id.type",
          total: 1,
        },
      },
    ]);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const formatted = days.map((day) => {
      const deposit = result.find((r) => r.day === day && r.type === "Income");
      const withdraw = result.find((r) => r.day === day && r.type === "Expense");
      return {
        day,
        Deposit: deposit ? deposit.total : 0,
        Withdraw: withdraw ? withdraw.total : 0,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Weekly chart data retrieved successfully",
      data: formatted,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = barchartFilterAggregation;