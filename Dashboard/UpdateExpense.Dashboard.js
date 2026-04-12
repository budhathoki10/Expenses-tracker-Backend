const ExpensesModel = require("../Models/expenses.models");
const walletModel = require("../Models/wallet.model");

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, category, account, description, date } = req.body;

    // find expense
    const findExpense = await ExpensesModel.findById(id);
    if (!findExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    // find wallet
    const findWallet = await walletModel.findOne({ userID: req.user._id });
    if (!findWallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found"
      });
    }

    // Step 1 — revert old transaction from wallet
    if (findExpense.type === "Expense") {
      findWallet.balance += findExpense.amount;  // add back old amount
    } else if (findExpense.type === "Income") {
      findWallet.balance -= findExpense.amount;  // remove old amount
    }

    // Step 2 — apply new transaction to wallet
    const newType   = type   || findExpense.type;
    const newAmount = Number(amount) || findExpense.amount;

    if (newType === "Expense") {
      findWallet.balance -= newAmount;
    } else if (newType === "Income") {
      findWallet.balance += newAmount;
    }

    // Step 3 — update expense fields
    findExpense.type        = newType;
    findExpense.amount      = newAmount;
    findExpense.category    = category    || findExpense.category;
    findExpense.account     = account     || findExpense.account;
    findExpense.description = description || findExpense.description;
    findExpense.Date        = date        || findExpense.Date;

    // Step 4 — save both
    await findExpense.save();
    await findWallet.save();

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: findExpense
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

module.exports = updateExpense;