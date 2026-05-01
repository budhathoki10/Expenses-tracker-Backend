const ExpensesModel = require("../Models/expenses.models");
const walletModel = require("../Models/wallet.model");

const getMonthlySummary = async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
    );
    const monthEnd = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      ),
    );

    const totals = await ExpensesModel.aggregate([
      {
        $match: {
          userID: req.user._id,
          Date: { $gte: monthStart, $lte: monthEnd },
          type: { $in: ["Income", "Expense"] },
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const incomeEntry = totals.find((item) => item._id === "Income");
    const expenseEntry = totals.find((item) => item._id === "Expense");
    const totalIncome = incomeEntry ? Number(incomeEntry.total) : 0;
    const totalExpense = expenseEntry ? Number(expenseEntry.total) : 0;

    const wallet = await walletModel.findOne({ userID: req.user._id });
    const walletBalance = wallet ? Number(wallet.balance) : 0;

    return res.status(200).json({
      success: true,
      message: "Monthly dashboard summary fetched successfully",
      data: {
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
        walletBalance,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = getMonthlySummary;
