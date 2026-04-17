// importing all the files and library
const { success } = require("zod");
const ExpensesModel = require("../Models/expenses.models");
const userModel= require("../Models/user.model")

// filter the expense data according to the category like food, transportation, clothes, education etc. 
const FilterData= async(req,res)=>{
try {
    const {category}= req.query
    if(!category){
   return  res.status(400).json({
        success:false,
        message:"no query params"
    })
}
// check if the category is present or not
    const FindData= await ExpensesModel.find({category:category})
    if(!FindData || FindData.length==0){
           return  res.status(400).json({
        success:false,
        message:"no any data for this Category"
    })
}
// sum all the total expenses of that particular data
const totalExpenses= FindData.reduce((a,e)=>a+e.amount,0)
console.log(totalExpenses)
// show the message of the expenses data
      return res.status(200).json({
      success: true,
      message: "Expenses fetched successfully",
      totalExpenses:totalExpenses,
      data: FindData,
    })
} catch (error) {
    // displaying all the error message
    res.status(500).json({
        success:false,
        message:"internal server error"
    })
}
}
module.exports= FilterData