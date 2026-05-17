const AIModel = require("../DashboardAI/AiModel");

const toTitleCase = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const extractAmount = (text) => {
  const match = String(text || "").match(/\d+(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?/);
  return match ? Number(match[0].replace(/,/g, "")) : 0;
};

const inferAction = (text) => {
  const lower = String(text || "").toLowerCase();

  if (/\b(income|received|receive|salary|bonus|deposit|paid|earning|earned|credit)\b/.test(lower)) {
    return "add_income";
  }

  if (/\b(expense|spent|spend|paid for|bought|buy|withdraw|debit|cost)\b/.test(lower)) {
    return "add_expense";
  }

  return "";
};

const inferAccount = (text, account) => {
  if (account === "Bank" || account === "Cash") return account;

  const lower = String(text || "").toLowerCase();
  if (/\b(bank|card|online|transfer|account|upi|esewa|khalti)\b/.test(lower)) {
    return "Bank";
  }

  return "Cash";
};

const inferCategory = (voiceText, command) => {
  const givenCategory = toTitleCase(command.category);
  if (givenCategory) return givenCategory;

  const text = `${voiceText || ""} ${command.description || ""}`.toLowerCase();

  const categoryRules = [
    ["Salary", /\b(salary|paycheck|wage|wages|monthly pay)\b/],
    ["Bonus", /\b(bonus|reward|incentive)\b/],
    ["Freelance", /\b(freelance|client|project payment)\b/],
    ["Interest", /\b(interest|dividend)\b/],
    ["Gift", /\b(gift|present)\b/],
    ["Refund", /\b(refund|cashback|reimbursement)\b/],
    ["Food", /\b(food|meal|lunch|dinner|breakfast|snack|restaurant|cafe|grocery|groceries)\b/],
    ["Transportation", /\b(transport|bus|taxi|cab|fuel|petrol|diesel|ride|fare)\b/],
    ["Rent", /\b(rent|room|flat|apartment)\b/],
    ["Bills", /\b(bill|electricity|water|internet|wifi|phone|recharge)\b/],
    ["Shopping", /\b(shopping|shop|bought|clothes|shirt|shoe|dress)\b/],
    ["Health", /\b(health|doctor|medicine|hospital|pharmacy)\b/],
    ["Entertainment", /\b(movie|cinema|game|entertainment|party)\b/],
    ["Education", /\b(education|school|college|book|course|tuition)\b/],
    ["Travel", /\b(travel|hotel|flight|trip)\b/],
  ];

  const match = categoryRules.find(([, pattern]) => pattern.test(text));
  if (match) return match[0];

  return command.action === "add_income" ? "Income" : "General";
};

const normalizeParsedCommand = (command, voiceText) => {
  const action =
    command.action === "add_income" || command.action === "add_expense"
      ? command.action
      : inferAction(voiceText);

  if (!action) {
    return { error: "Unable to parse command" };
  }

  const amount = Number(command.amount) || extractAmount(voiceText);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Unable to parse amount from command" };
  }

  const normalizedCommand = {
    action,
    amount,
    description: String(command.description || voiceText || "").trim(),
    account: inferAccount(voiceText, command.account),
  };

  normalizedCommand.category = inferCategory(voiceText, {
    ...command,
    action,
  });

  if (!normalizedCommand.description) {
    normalizedCommand.description =
      action === "add_income"
        ? `${normalizedCommand.category} income`
        : `${normalizedCommand.category} expense`;
  }

  return normalizedCommand;
};

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
  "category": string (required; infer from context, e.g., "Food", "Transportation", "Salary", "Bonus". If not clear, use "Income" for income and "General" for expense),
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

Input: "Add income of 1000 in my bank account"
Output: {"action":"add_income","amount":1000,"category":"Income","description":"Income in bank account","account":"Bank"}

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

    return normalizeParsedCommand(jsonResponse, voiceText);
  } catch (error) {
    console.error("Voice command parsing error:", error);
    return { error: "Unable to parse command" };
  }
};

module.exports = { parseVoiceCommand };
