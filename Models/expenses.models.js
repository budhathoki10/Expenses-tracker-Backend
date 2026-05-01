const mongoose = require("mongoose");
const TransactionsSchema = mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  type: {
    type: String,
 enum: ["Expense", "Income"],   // 'income' | 'expense' | 'transfer'
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,      // 'Food' | 'Clothes' | 'Bonus' etc.
  },
  account: {
    type: String,
     enum: ["Cash", "Bank"],
  },
  description: {
    type: String,
  },
  Date:{
    type:Date,
    default:Date.now
  },
});
const ExpensesModel = mongoose.model("Transaction", TransactionsSchema);
module.exports = ExpensesModel;
