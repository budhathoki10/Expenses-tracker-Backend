const ExpensesModel = require("../Models/expenses.models");

const filterAggregation = async (req, res) => {
  const { filter } = req.query;
  try {
    const now = new Date();
    let startDate, endDate;

    if (!filter) {
      return res.status(400).json({
        success: false,
        message: "Filter query parameter is required",
      });
    }

    if (filter === "weekly") {
      const currentDay = now.getUTCDay();

      startDate = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() - currentDay,
          0,
          0,
          0,
          0,
        ),
      );

      endDate = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + (6 - currentDay),
          23,
          59,
          59,
          999,
        ),
      );
    } else if (filter === "monthly") {
      startDate = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
      );
      endDate = new Date(
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
    } else if (filter === "yearly") {
      startDate = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
      endDate = new Date(
        Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59, 999),
      );
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid filter — use weekly | monthly | yearly",
      });
    }
    //  await ExpensesModel.insertMany([

    // { userID: req.user._id, type: "Expense", amount: 150,  category: "food",          account: "Cash", Date: new Date("2026-03-30T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 200,  category: "travel",        account: "Cash", Date: new Date("2026-03-31T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 350,  category: "clothes",       account: "Cash", Date: new Date("2026-04-01T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 100,  category: "food",          account: "Cash", Date: new Date("2026-04-02T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 500,  category: "entertainment", account: "Cash", Date: new Date("2026-04-03T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 250,  category: "food",          account: "Cash", Date: new Date("2026-04-04T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 180,  category: "travel",        account: "Cash", Date: new Date("2026-04-05T00:00:00.000Z") },

    //     // monthly extra (Apr 6 - Apr 28)
    //     { userID: req.user._id, type: "Expense", amount: 1200, category: "rent",          account: "Bank", Date: new Date("2026-04-06T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 800,  category: "food",          account: "Cash", Date: new Date("2026-04-07T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 450,  category: "clothes",       account: "Cash", Date: new Date("2026-04-08T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 300,  category: "travel",        account: "Bank", Date: new Date("2026-04-10T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 600,  category: "entertainment", account: "Cash", Date: new Date("2026-04-12T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 150,  category: "health",        account: "Bank", Date: new Date("2026-04-14T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 900,  category: "food",          account: "Cash", Date: new Date("2026-04-16T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 200,  category: "health",        account: "Bank", Date: new Date("2026-04-18T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 750,  category: "clothes",       account: "Cash", Date: new Date("2026-04-20T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 400,  category: "rent",          account: "Bank", Date: new Date("2026-04-22T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 350,  category: "travel",        account: "Cash", Date: new Date("2026-04-25T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 500,  category: "food",          account: "Cash", Date: new Date("2026-04-28T00:00:00.000Z") },

    //     // January
    //     { userID: req.user._id, type: "Expense", amount: 1500, category: "rent",          account: "Bank", Date: new Date("2026-01-01T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 600,  category: "food",          account: "Cash", Date: new Date("2026-01-05T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 300,  category: "travel",        account: "Cash", Date: new Date("2026-01-10T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 800,  category: "clothes",       account: "Cash", Date: new Date("2026-01-15T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 200,  category: "health",        account: "Bank", Date: new Date("2026-01-20T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 400,  category: "entertainment", account: "Cash", Date: new Date("2026-01-25T00:00:00.000Z") },

    //     // February
    //     { userID: req.user._id, type: "Expense", amount: 1500, category: "rent",          account: "Bank", Date: new Date("2026-02-01T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 750,  category: "food",          account: "Cash", Date: new Date("2026-02-05T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 250,  category: "travel",        account: "Bank", Date: new Date("2026-02-10T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 500,  category: "clothes",       account: "Cash", Date: new Date("2026-02-14T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 350,  category: "health",        account: "Bank", Date: new Date("2026-02-20T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 600,  category: "entertainment", account: "Cash", Date: new Date("2026-02-25T00:00:00.000Z") },

    //     // March
    //     { userID: req.user._id, type: "Expense", amount: 1500, category: "rent",          account: "Bank", Date: new Date("2026-03-01T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 900,  category: "food",          account: "Cash", Date: new Date("2026-03-05T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 400,  category: "travel",        account: "Cash", Date: new Date("2026-03-10T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 650,  category: "clothes",       account: "Cash", Date: new Date("2026-03-15T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 300,  category: "health",        account: "Bank", Date: new Date("2026-03-20T00:00:00.000Z") },
    //     { userID: req.user._id, type: "Expense", amount: 450,  category: "entertainment", account: "Cash", Date: new Date("2026-03-25T00:00:00.000Z") },

    //  ])

    const AggregationResult = await ExpensesModel.aggregate([
      {
        $match: {
          userID: req.user._id,
          type: "Expense",
          Date: { $gte: startDate, $lte: endDate },
        },
      },

      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
    ]);
    const totalExpense = AggregationResult.reduce(
      (acc, item) => acc + item.total,
      0,
    );

    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      Data: AggregationResult,
      totalExpense: totalExpense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

module.exports = filterAggregation;
