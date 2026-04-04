const ExpensesModel = require("../Models/expenses.models");

const viewExpenses = async (req, res) => {
try {
      const data = await ExpensesModel.find({ userID: req.user._id }).populate(
        "userID",
        "userName email",
      );
    
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "No expenses found for this user",
        });
      }
    //   console.log(req.user.email);
          console.log(req.user._id);
      return res.status(200).json({
        success: true,
        message: "User expenses details",
        data: data,
      })
} catch (error) {
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
};
module.exports = viewExpenses;
