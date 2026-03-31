const ExpensesModel = require("../Models/expenses.models");
const z = require("zod");
const userModel = require("../Models/user.model");
const walletModel = require("../Models/wallet.model");
const validateExpense = require("../Validation/expenses.validation");
// const emailTemplate = require("../Email/ExpeseTemplate.email");
// const sendEmail = require("../Email/sendEmail");
const ExpensesData = async (req, res) => {
try {
      const parsedData = validateExpense.parse(req.body);
      const { type, amount, category, account, description } = parsedData;
      // console.log("hello")
      // console.log("user id is",req.user._id)

    let findWallet= await walletModel.findOne({userID:req.user._id})
    console.log("testing")
    if(!findWallet){
       findWallet= await walletModel.create({userID:req.user._id, balance:1000})
    }
    if(type === "Expense" && findWallet.balance < amount){
        return res.status(400).json({ 
            sucess:false, 
            message: "Insufficient balance in the wallet"
        });
    }
    console.log("hello")
      const newData= new ExpensesModel({
        userID: req.user._id,
        type: type,
        amount: amount,
        category: category,
        account: account,
        description: description
        })
        await newData.save()
            if(type === "Expense"){
        findWallet.balance -= amount
    }
    else if(type === "Income"){
        findWallet.balance += amount
    }
    await findWallet.save()
    
    // populate the userID field with user details
    await newData.populate("userID", "userName email");
    //  const populatedData = await ExpensesModel.findById(newData._id).populate("userID", "userName email");

      return res.status(200).json({ 
        sucess:true,
        message: "Expense added Successfully",
        data: newData
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
        sucess:true,
        message: "internal server error" 
    });

}
};
module.exports = ExpensesData;
