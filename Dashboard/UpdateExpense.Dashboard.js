const ExpensesModel = require("../Models/expenses.models");
const walletModel = require("../Models/wallet.model");

const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;  
        const { type, amount, category, account, description } = req.body;
        const findExpense = await ExpensesModel.findById(id);
        if (!findExpense) {
            return res.status(404).json({ message: "Expense not found" });
        }
        const findWallet = await walletModel.findOne({ userID: req.user._id });
        if (!findWallet) {
            return res.status(404).json({ message: "Wallet not found" });
        }
        const DifferenceMoney= amount - findExpense.amount;
        if (findExpense.type === "Expense") {
            findWallet.balance -= DifferenceMoney;
        } else if (findExpense.type === "Income") {
            findWallet.balance += DifferenceMoney;
        }
        findExpense.type = type || findExpense.type;
        findExpense.amount = amount || findExpense.amount;
        findExpense.category = category || findExpense.category;
        findExpense.account = account || findExpense.account;
        findExpense.description = description || findExpense.description;
        await findExpense.save();
        await findWallet.save();
        res.status(200).json({ message: "Expense updated successfully", data: findExpense });
    }
        catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}
module.exports = updateExpense;

