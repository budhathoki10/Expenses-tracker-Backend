const ExpensesModel = require("../Models/expenses.models");
const userModel= require("../Models/user.model");
const { Configuration, OpenAIApi } = require("openai");
const AIModel = require("./AiModel");


const DashboardAI= async(req,res)=>{
try {
    const usermessage= req.body;
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

**Task:**
Analyze this user's spending pattern and provide:

1. **Overall Financial Health Assessment** (1 paragraph)
   - Is their spending reasonable or excessive?
   - Are they overspending in any area?

2. **Category-wise Analysis** (for each category)
   - Identify which categories are essential vs non-essential
   - Point out categories where they're spending too much
   - Suggest specific percentage to reduce (be realistic, not extreme)

3. **Actionable Savings Plan for Next Month**
   - Suggest 3-5 specific actions to reduce expenses
   - Mention exact categories to cut down
   - Provide realistic target amounts to save
   - Give practical tips (e.g., "Cook at home 3 times a week instead of eating out")

4. **Priority Ranking**
   - List categories from "Must Keep" to "Can Reduce" to "Should Cut"

5. **Next Month Budget Recommendation**
   - Suggest category-wise budget for next month
   - Total recommended expense for next month
   - Expected savings amount

**Guidelines:**
- Be honest but encouraging
- Provide practical, achievable suggestions
- Consider Nepali/Indian context (food, transport, culture)
- Don't suggest eliminating categories completely
- Focus on reducing 10-30% from non-essential categories
- Use simple, clear language
- Be specific with numbers and percentages

**Rules:**
- Always provide insights based on the user's expense data only
- If the user asks anything unrelated to expenses or financial planning, respond exactly with: "Sorry, I can only provide insights related to your expenses and financial planning. Please ask about your spending patterns, category-wise analysis, or savings plan."
- If there is no user message, respond with: "How can I help you with your expenses today?"
- provide data in a pragraph form and not in a list form

**User Message:** ${usermessage?.message || ''}

**Response Format:**
Write ONLY in plain paragraph text. Strict rules:
- NO markdown, NO asterisks, NO hashtags, NO bullet points, NO dashes
- NO bold, NO italic, NO headings, NO symbols
- Write exactly like a friend explaining finances in simple conversation
- Use plain sentences and natural paragraph breaks only
- dont write in a same line use paragraph breaks to make it more readable
- Start directly with the analysis, no greetings or titles

-  provide the answer in short and sweet manner, not more than 3-4 paragraphs. Be concise and to the point.
`;
    

    
const result= await AIModel(prompt,res);


res.status(200).json({
    success:true,
    message:"AI analysis generated successfully",
    data:result
})

    
    
} catch (error) {
    res.status(500).json({ 
        success:false,
        message: "Internal server error" 
    });
}




}
module.exports= DashboardAI