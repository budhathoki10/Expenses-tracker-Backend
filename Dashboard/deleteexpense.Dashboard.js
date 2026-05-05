// importing all the files and modules
const ExpensesModel = require("../Models/expenses.models");
const walletModel = require("../Models/wallet.model");
// delete the expense data
const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        // check user id 
        const checkID= await ExpensesModel.findById(id);
        // console.log("hello")
        if(!checkID){
            return res.status(404).json({ message: "Expense not found" });
        }
        // delete the expense data if the id is found
        const deletedExpense = await ExpensesModel.findByIdAndDelete(id);
        if(!deletedExpense){
            return res.status(404).json({ message: "Cannot delete this expense" });
        }
        // alter the deleted money in a main balance
        const findWallet= await walletModel.findOne({userID:req.user._id})
        if(deletedExpense.type === "Expense"){
            findWallet.balance += deletedExpense.amount
        }
        else if(deletedExpense.type === "Income"){
            findWallet.balance -= deletedExpense.amount
        }
        // save the final moneyp
        await findWallet.save()
        res.status(200).json({ message: "Expense deleted successfully" });


        
    } catch (error) {
         res.status(500).json({ message: "Internal server error" });
    }
}
module.exports = deleteExpense;