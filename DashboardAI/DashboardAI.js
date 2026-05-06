const ExpensesModel = require("../Models/expenses.models");
const userModel= require("../Models/user.model");
const { Configuration, OpenAIApi } = require("openai");
const AIModel = require("./AiModel");


const DashboardAI= async(req,res)=>{
try {
    const rawUserMessage = req.body?.message ?? req.query?.message ?? '';
    const usermessage = typeof rawUserMessage === 'string' ? rawUserMessage.trim() : String(rawUserMessage);
    const now = new Date();
    const expenses = await ExpensesModel.find({ userID: req.user._id });
    const user = await userModel.findById(req.user._id);

    const startDate = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
    );
    const endDate = new Date(
        Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth() + 1,
            0,
            23,
            59,
            59,
            999,
        ),
    );
    
    const AggregationResultExpense = await ExpensesModel.aggregate([
        {
            $match: {
                userID: req.user._id,
                type: "Expense",
                Date: { $gte: startDate, $lte: endDate },
            },
        },
        
        {
            // groupping the data according to the category wise
            $group: {
          _id: "$category",
          // summing all the money
          total: { $sum: "$amount" },
        },
    },
    { $sort: { total: -1 } },
]);
const totalExpense = AggregationResultExpense.reduce(
    (acc, item) => acc + item.total,
    0,
);

    const AggregationResultIncome = await ExpensesModel.aggregate([
        {
            $match: {
                userID: req.user._id,
                type: "Income",
                Date: { $gte: startDate, $lte: endDate },
            },
        },
        
        {
            // groupping the data according to the category wise
            $group: {
          _id: "$category",
          // summing all the money
          total: { $sum: "$amount" },
        },
    },
    { $sort: { total: -1 } },
]);
const totalIncome = AggregationResultIncome.reduce(
    (acc, item) => acc + item.total,
    0,
);


const highestExpense= AggregationResultExpense.length>0?AggregationResultExpense[0]:null
const LowestExpense= AggregationResultExpense.length>0?AggregationResultExpense[AggregationResultExpense.length-1]:null

// console.log("user data is",user)
// console.log("expenses  data is",AggregationResult)

console.log("hellpoooo")

const topCategories = AggregationResultExpense.slice(0, 3);
const topCategoriesText = topCategories.length > 0
    ? topCategories.map((item, i) => `${i + 1}. ${item._id}: Rs ${item.total}`).join('\n')
    : 'No expense data available';

const expenseBreakdown = AggregationResultExpense.length > 0
    ? AggregationResultExpense.map(item => `- ${item._id}: Rs ${item.total}`).join('\n')
    : 'No expenses recorded this month';

const incomeBreakdown = AggregationResultIncome.length > 0
    ? AggregationResultIncome.map(item => `- ${item._id}: Rs ${item.total}`).join('\n')
    : 'No income recorded this month';

const prompt = `You are a personal finance advisor analyzing monthly expenses for better financial planning.

**User Information:**
- Name: ${user.userName}
- this Month data: 
- Total Monthly Expense: Rs ${totalExpense || 0}
- Total Monthly Income: Rs ${totalIncome || 0}
- Current Month: ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}
- Net Savings: Rs ${totalIncome - totalExpense}

**Expense Breakdown by Category:**
${expenseBreakdown}

**Income Breakdown by Category:**
${incomeBreakdown}

**Top Spending Categories:**
${topCategoriesText}

**Highest Expense Category:** ${highestExpense ? `${highestExpense._id}: Rs ${highestExpense.total}` : 'N/A'}
**Lowest Expense Category:** ${LowestExpense ? `${LowestExpense._id}: Rs ${LowestExpense.total}` : 'N/A'}

---

**note: Answer must be short and focused on the user request.**

**Task:**
Use the user's expense data to answer exactly what the user asks. If the user asks a specific question, respond to that question only and do not add unrelated analysis, plans, or next month recommendations.

If the user asks for a general overview, provide a concise monthly expense trend summary in plain paragraph form.

If the user asks about savings or expense reduction, give a short single-paragraph recommendation with realistic percentages or amounts based on the current expense data.

If the user asks about wallet balance or expense totals, return just those details clearly without extra suggestions.

Keep the answer short and sweet, no more than 4 sentences.

**Guidelines:**
- Be honest but encouraging
- Provide practical, achievable suggestions
- Consider Nepali/Indian context (food, transport, culture)
- Don't suggest eliminating categories completely
- Focus on short and sweet advice, not long essays
- Use simple, clear language
- Be specific with numbers and percentages

**Rules:**
- Always provide insights based on the user's expense data only
- If the user asks from outside of the scope, respond exactly with: "Sorry, I can only provide insights related to your expenses and financial planning. Please ask about your spending patterns, category-wise analysis, or savings plan."
- If there is no user message, respond with: "How can I help you with your expenses today?"
- provide data in a pragraph form and not in a list form


**Response Format:**
Write ONLY in plain paragraph text. Strict rules:
- NO markdown, NO asterisks, NO hashtags, NO bullet points, NO dashes
- NO bold, NO italic, NO headings, NO symbols
- Write exactly like a friend explaining finances in simple conversation
- Use plain sentences and natural paragraph breaks only
- dont write in a same line use paragraph breaks to make it more readable
- Start directly with the analysis, no greetings or titles
- greet the user by their name for first time only

- if the user say thank you, i got it or whatever then respond with "You're welcome! If you have any more questions about your expenses or need further advice, feel free to ask. I'm here to help you manage your finances better!"
**User Message:** ${usermessage || ''}



`;
    

    
const result= await AIModel(prompt);


res.status(200).json({
    success:true,
    message:"AI analysis generated successfully",
    data:result
})

    
    
} catch (error) {
    console.error("DashboardAI error:", error);
    res.status(500).json({ 
        success:false,
        message: "Internal server error found" 
    });
}




}
module.exports= DashboardAI