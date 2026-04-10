const { success } = require("zod");
const ExpensesModel = require("../Models/expenses.models");
const userModel= require("../Models/user.model")


const FilterData= async(req,res)=>{
try {
    const {category}= req.query
    if(!category){
   return  res.status(400).json({
        success:false,
        message:"no query params"
    })
}
    const FindData= await ExpensesModel.find({category:category})
    if(!FindData || FindData.length==0){
           return  res.status(400).json({
        success:false,
        message:"no any data for this Category"
    })
}
const totalExpenses= FindData.reduce((a,e)=>a+e.amount,0)
console.log(totalExpenses)
      return res.status(200).json({
      success: true,
      message: "Expenses fetched successfully",
      totalExpenses:totalExpenses,
      data: FindData,
    })

    
   

} catch (error) {
    res.status(500).json({
        success:false,
        message:"internal server error"
    })
}
}
module.exports= FilterData