const expensesModel = require("../Models/expenses.models");
const Aggregation = require("../Aggregation/Aggregation");
const AIModel = require("../DashboardAI/AiModel");
const SummaryData= async (req, res) => {
    try {
         const { filter } = req.query;
       const result=   await Aggregation(req, res, filter);
       console.log(result)


       const prompt = `You are a personal finance advisor giving a quick  expense summary.
       
 Expense Data:
 - Total  Expense: Rs ${result.totalExpense}
 - Highest Spending Category: ${result.highestExpense._id} at Rs ${result.highestExpense.total}
 - Lowest Spending Category: ${result.LowestExpense._id} at Rs ${result.LowestExpense.total}
 - Category Breakdown: ${result.AggregationResult.map(item => `${item._id}: Rs ${item.total}`).join(', ')}
 
 Give a short 2 to 3 line plain text summary of this expenses.
 
 Rules:
 - NO markdown, NO asterisks, NO bullet points, NO headings, NO symbols
 - Plain sentences and natural paragraph breaks only
 - Be specific with the actual numbers from the data
 - Keep it short and simple
 `;
 const aiResult= await AIModel(prompt);
 res.status(200).json({
    success: true,
    data: aiResult,
})


console.log("hello")

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server errorss",
        });
    }
}
module.exports = SummaryData;