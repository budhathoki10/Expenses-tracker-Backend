// importing all the expenses
const ExpensesModel = require("../Models/expenses.models");
const z = require("zod");
const userModel = require("../Models/user.model");
const walletModel = require("../Models/wallet.model");
const validateExpense = require("../Validation/expenses.validation");
const emailHandler = require("../EmailWiring/email.wiring");
const viewWallet = require("../viewOwnWallet/viewWallet.wallet");

// this function helps to add expense  and income. if user expense then money get decrease and if income then money will increase
const ExpensesData = async (req, res) => {
  try {
    const parsedData = validateExpense.parse(req.body);
    const { type, amount, category, account, description } = parsedData;
    // console.log("hello")
    // console.log("user id is",req.user._id)

    let findWallet = await walletModel.findOne({ userID: req.user._id });

    if (!findWallet) {
      findWallet = await walletModel.create({
        userID: req.user._id,
        balance: 1000,
      });
    }

    // check what user want to if expense or income
    if (type === "Expense" && findWallet.balance < amount) {
      return res.status(400).json({
        sucess: false,
        message: "Insufficient balance in the wallet",
      });
    }
// make a new data for user 
    const newData = new ExpensesModel({
      userID: req.user._id,
      type: type,
      amount: amount,
      category: category,
      account: account,
      description: description,
    });
    // save the data in mongodb

    await newData.save();
    if (type === "Expense") {
      // if expense withdraw money 
      findWallet.balance -= amount;
    } else if (type === "Income") {
            // if income add money 
      findWallet.balance += amount;
    }
    // save the final one
    await findWallet.save();

    // populate the userID field with user details
    // await newData.populate("userID", "userName email");
    const populatedData = await ExpensesModel.findById(newData._id).populate(
      "userID",
      "userName email",
    );
    try {
      if (type === "Expense") {
        await emailHandler.ExpenseEmail(populatedData, findWallet);
      } else if (type === "Income") {
        await emailHandler.IncomeEmail(populatedData, findWallet);
      }
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    // console.log("testing12");
    return res.status(200).json({
      success: true,
      message: "Expense added Successfully",
      data: populatedData,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(500).json({
        status: "internal server error in zod validation",
        errors: error.issues.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    return res.status(500).json({
      sucess: false,
      message: "internal server errors",
    });
  }
};
module.exports = ExpensesData;
