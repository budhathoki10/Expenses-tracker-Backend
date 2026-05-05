const AIModel = require("../DashboardAI/AiModel");

const parseVoiceCommand = async (voiceText) => {
  try {
    const prompt = `You are an AI assistant that parses voice commands for an expense tracker app. The user will speak commands like:
- "Add expense of 500 rupees for food"
- "I spent 200 on groceries"
- "Add income of 1000 from salary"
- "Received 500 bonus"
- "Please expense 100 rupees for food"
- "Please add expense of 200 from my bank account"

Parse the voice text and return ONLY a valid JSON object with the following structure:
{
  "action": "add_expense" or "add_income",
  "amount": number (extract the amount, remove currency words like rupees, ₹),
  "category": string (infer from context, e.g., "Food", "Transportation", "Salary", "Bonus"),
  "description": string (brief description from the text),
  "account": "Cash" or "Bank" (default to "Cash" if not specified)
}

If the command is not clear or doesn't match expense/income addition, return:
{"error": "Unable to parse command"}

IMPORTANT: Return ONLY the JSON object, no code, no explanations, no markdown, no extra text.

Examples:
Input: "Add expense of 500 rupees for food"
Output: {"action":"add_expense","amount":500,"category":"Food","description":"Food expense","account":"Cash"}

Input: "I received 1000 salary"
Output: {"action":"add_income","amount":1000,"category":"Salary","description":"Salary income","account":"Cash"}

Input: "Spent 200 on transport"
Output: {"action":"add_expense","amount":200,"category":"Transportation","description":"Transport expense","account":"Cash"}

Input: "Please expense 100 rupees for food"
Output: {"action":"add_expense","amount":100,"category":"Food","description":"Food expense","account":"Cash"}

Input: "Please add expense of 200 from my bank account"
Output: {"action":"add_expense","amount":200,"category":"General","description":"Expense from bank account","account":"Bank"}

Voice text: "${voiceText}"
`;

    const response = await AIModel(prompt);

    console.log("AI Response for voice command:", response);

    // Clean the response to extract JSON
    let jsonResponse;
    try {
      // Remove any markdown or extra text, find JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonResponse = JSON.parse(jsonMatch[0]);
        console.log("Parsed JSON:", jsonResponse);
      } else {
        console.log("No JSON match found in response");
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", response);
      return { error: "Unable to parse command" };
    }

    return jsonResponse;
  } catch (error) {
    console.error("Voice command parsing error:", error);
    return { error: "Unable to parse command" };
  }
};

module.exports = { parseVoiceCommand };