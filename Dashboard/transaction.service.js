const ExpensesModel = require("../Models/expenses.models");
const walletModel = require("../Models/wallet.model");
const validateExpense = require("../Validation/expenses.validation");
const emailHandler = require("../EmailWiring/email.wiring");

const DEFAULT_WALLET_BALANCE = 1000;

const createHttpError = (statusCode, message, details = {}) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
};

const createTransaction = async ({ userId, transactionData }) => {
  const parsedData = validateExpense.parse(transactionData);
  const { type, amount, category, account, description } = parsedData;
  const transactionDate = parsedData.Date || parsedData.date;

  let wallet = await walletModel.findOne({ userID: userId });

  if (!wallet) {
    wallet = await walletModel.create({
      userID: userId,
      balance: DEFAULT_WALLET_BALANCE,
    });
  }

  if (type === "Expense" && wallet.balance < amount) {
    throw createHttpError(400, "Insufficient balance in the wallet", {
      balance: wallet.balance,
    });
  }

  const transactionPayload = {
    userID: userId,
    type,
    amount,
    category,
    account,
    description,
  };

  if (transactionDate) {
    transactionPayload.Date = transactionDate;
  }

  const transaction = await ExpensesModel.create(transactionPayload);

  if (type === "Expense") {
    wallet.balance -= amount;
  } else if (type === "Income") {
    wallet.balance += amount;
  }

  wallet.UpdatedAt = new Date();
  await wallet.save();

  const populatedTransaction = await ExpensesModel.findById(
    transaction._id,
  ).populate("userID", "userName email");

  try {
    if (type === "Expense") {
      await emailHandler.ExpenseEmail(populatedTransaction, wallet);
    } else if (type === "Income") {
      await emailHandler.IncomeEmail(populatedTransaction, wallet);
    }
  } catch (emailError) {
    console.error("Email sending failed:", emailError);
  }

  return {
    transaction: populatedTransaction,
    wallet,
  };
};

module.exports = { createTransaction };
