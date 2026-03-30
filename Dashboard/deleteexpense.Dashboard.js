const ExpensesModel = require("../Models/expenses.models");
const walletModel = require("../Models/wallet.model");
const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const checkID= await ExpensesModel.findById(id);
        console.log("hello")
        if(!checkID){
            return res.status(404).json({ message: "Expense not found" });
        }
        const deletedExpense = await ExpensesModel.findByIdAndDelete(id);
        if(!deletedExpense){
            return res.status(404).json({ message: "Cannot delete this expense" });
        }
        const findWallet= await walletModel.findOne({userID:req.user._id})
        if(deletedExpense.type === "Expense"){
            findWallet.balance += deletedExpense.amount
        }
        else if(deletedExpense.type === "Income"){
            findWallet.balance -= deletedExpense.amount
        }
        await findWallet.save()
        res.status(200).json({ message: "Expense deleted successfully" });


        
    } catch (error) {
         res.status(500).json({ message: "Internal server error" });
    }
}
module.exports = deleteExpense;