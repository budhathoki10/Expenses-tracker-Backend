/*
 * saveGoalController.js
 *
 * Handles all backend logic for the goal-based savings feature.
 *
 * Functions:
 *   1. saveGoal   - creates a new goal (no timeframe, has priority)
 *   2. getGoals   - fetches all goals sorted by priority (high → medium → low)
 *   3. addSaving  - deposits money into a goal (checks wallet balance first)
 *   4. editGoal   - updates an existing goal's details
 *   5. deleteGoal - deletes a goal and refunds saved money back to wallet
 *
 * Models used:
 *   - Goal        (../Models/goals.model)
 *   - Wallet      (../Models/wallet.model)
 *   - Transaction (../Models/expenses.models)
 */

const Goal = require("../Models/goals.model");
const Wallet = require("../Models/wallet.model");
const Transaction = require("../Models/expenses.models");

// Priority sort order - high comes first, then medium, then low
const PRIORITY_ORDER = { high: 1, medium: 2, low: 3 };

// =============================================================
// FUNCTION 1: saveGoal
// -------------------------------------------------------------
// Creates a new financial goal for the logged-in user.
// Required fields: goalName, targetAmount, priority, deadline
// timeframe has been removed from this feature.
//
// Route:  POST /api/save-goal
// Access: Private (requires JWT token)
// =============================================================
const saveGoal = async (req, res) => {
  try {
    // pull out only the fields we need (timeframe removed)
    const { goalName, targetAmount, priority, deadline } = req.body;

    // check all required fields are present
    if (!goalName || !targetAmount || !priority || !deadline) {
      return res.status(400).json({
        success: false,
        message:
          "goalName, targetAmount, priority, and deadline are all required.",
      });
    }

    // targetAmount must be a positive number
    if (isNaN(targetAmount) || Number(targetAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "targetAmount must be a positive number.",
      });
    }

    // priority must be one of these 3 values only
    const validPriorities = ["low", "medium", "high"];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "priority must be one of: low, medium, high.",
      });
    }

    // convert deadline string to a Date object and validate it
    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({
        success: false,
        message: "deadline must be a valid date (e.g. 2025-12-31).",
      });
    }
    if (parsedDeadline <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "deadline must be a future date.",
      });
    }

    // all validations passed - create and save the goal
    // req.user._id comes from the auth middleware
    const newGoal = new Goal({
      userId: req.user._id,
      goalName: goalName.trim(),
      targetAmount: Number(targetAmount),
      priority,
      deadline: parsedDeadline,
    });

    await newGoal.save();

    res.status(201).json({
      success: true,
      message: "Goal saved successfully!",
      data: {
        id: newGoal._id,
        goalName: newGoal.goalName,
        targetAmount: newGoal.targetAmount,
        savedAmount: newGoal.savedAmount,
        remainingAmount: newGoal.targetAmount,
        progressPercentage: "0.00%",
        priority: newGoal.priority,
        deadline: newGoal.deadline,
        createdAt: newGoal.createdAt,
      },
    });
  } catch (error) {
    console.error("Save Goal Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while saving goal.",
    });
  }
};

// =============================================================
// FUNCTION 2: getGoals
// -------------------------------------------------------------
// Fetches all goals for the logged-in user sorted by priority.
// high priority goals appear first, then medium, then low.
// This way the frontend just displays goals in the order received
// and the highest priority goal is always at the top.
//
// Route:  GET /api/goals
// Access: Private (requires JWT token)
// =============================================================
const getGoals = async (req, res) => {
  try {
    // fetch all goals belonging to the logged-in user
    const goals = await Goal.find({ userId: req.user._id });

    if (goals.length === 0) {
      return res.status(200).json({
        success: true,
        message: "You have no goals yet. Start by creating one!",
        data: [],
      });
    }

    // sort goals by priority: high → medium → low
    // PRIORITY_ORDER maps each priority to a number (1, 2, 3)
    // so sorting ascending puts high (1) before medium (2) before low (3)
    const sortedGoals = goals.sort(
      (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
    );

    // calculate progress fields for each goal before sending to frontend
    const goalsWithProgress = sortedGoals.map((goal) => {
      const remainingAmount = Math.max(goal.targetAmount - goal.savedAmount, 0);
      const progressPercentage = Math.min(
        ((goal.savedAmount / goal.targetAmount) * 100).toFixed(2),
        100,
      );
      return {
        id: goal._id,
        goalName: goal.goalName,
        targetAmount: goal.targetAmount,
        savedAmount: goal.savedAmount,
        remainingAmount,
        progressPercentage: `${progressPercentage}%`,
        priority: goal.priority,
        deadline: goal.deadline,
        createdAt: goal.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      count: goals.length,
      data: goalsWithProgress,
    });
  } catch (error) {
    console.error("Get Goals Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching goals.",
    });
  }
};

// =============================================================
// FUNCTION 3: addSaving
// -------------------------------------------------------------
// Deposits money into a specific goal.
// Checks wallet balance first, deducts from wallet,
// adds to goal savedAmount, and records a transaction.
//
// Route:  POST /api/goals/:id/add-saving
// Access: Private (requires JWT token)
// =============================================================
const addSaving = async (req, res) => {
  try {
    const { amount, note, account } = req.body;

    // validate amount
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid positive amount.",
      });
    }

    // account must be Cash or Bank (matches Transaction model enum)
    const validAccounts = ["Cash", "Bank"];
    if (!account || !validAccounts.includes(account)) {
      return res.status(400).json({
        success: false,
        message: "Please specify account: Cash or Bank.",
      });
    }

    // find the goal by ID from the URL params
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });
    }

    // make sure this goal belongs to the logged-in user
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to add savings to this goal.",
      });
    }

    // block deposits if goal is already completed
    if (goal.savedAmount >= goal.targetAmount) {
      return res.status(400).json({
        success: false,
        message: "This goal is already completed! No more deposits needed.",
      });
    }

    // check if user has enough balance in their wallet
    const wallet = await Wallet.findOne({ userID: req.user._id });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found. Please set up your wallet first.",
      });
    }

    if (wallet.balance < Number(amount)) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Your wallet has Rs. ${wallet.balance} but you tried to deposit amount Rs. ${amount}.`,
      });
    }

    // deduct from wallet
    const previousBalance = wallet.balance;
    wallet.balance -= Number(amount);
    wallet.UpdatedAt = Date.now();
    await wallet.save();

    // add to goal savedAmount
    goal.savedAmount += Number(amount);
    await goal.save();

    // record this as an Expense transaction in the transaction history
    const transaction = await Transaction.create({
      userID: req.user._id,
      type: "Expense",
      amount: Number(amount),
      category: "Goal Saving",
      account,
      description: note
        ? `Goal: ${goal.goalName} — ${note}`
        : `Goal saving: ${goal.goalName}`,
      Date: Date.now(),
    });

    // calculate updated progress
    const remainingAmount = Math.max(goal.targetAmount - goal.savedAmount, 0);
    const progressPercentage = Math.min(
      ((goal.savedAmount / goal.targetAmount) * 100).toFixed(2),
      100,
    );
    const isCompleted = goal.savedAmount >= goal.targetAmount;

    res.status(200).json({
      success: true,
      message: isCompleted
        ? ` Congratulations! You completed your goal: "${goal.goalName}"!`
        : ` Rs. ${amount} added to "${goal.goalName}". Rs. ${remainingAmount} remaining.`,
      data: {
        goal: {
          id: goal._id,
          goalName: goal.goalName,
          targetAmount: goal.targetAmount,
          savedAmount: goal.savedAmount,
          remainingAmount,
          progressPercentage: `${progressPercentage}%`,
          isCompleted,
        },
        wallet: {
          previousBalance,
          amountDeducted: Number(amount),
          newBalance: wallet.balance,
        },
        transaction: {
          id: transaction._id,
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          account: transaction.account,
          description: transaction.description,
          date: transaction.Date,
        },
      },
    });
  } catch (error) {
    console.error("Add Saving Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while adding saving.",
    });
  }
};

// =============================================================
// FUNCTION 4: editGoal
// -------------------------------------------------------------
// Updates an existing goal's details.
// Only updates fields that were actually sent in the request.
// timeframe has been removed from editable fields.
//
// Route:  PUT /api/goals/:id
// Access: Private (requires JWT token)
// =============================================================
const editGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });
    }

    // ownership check
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this goal.",
      });
    }

    // pull out editable fields (timeframe, deadline removed)
    const { goalName, targetAmount, priority } = req.body;

    // validate only the fields that were sent
    if (targetAmount !== undefined) {
      if (isNaN(targetAmount) || Number(targetAmount) <= 0) {
        return res.status(400).json({
          success: false,
          message: "targetAmount must be a positive number.",
        });
      }
    }

    if (priority !== undefined) {
      const validPriorities = ["low", "medium", "high"];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "priority must be one of: low, medium, high.",
        });
      }
    }

    // build update object with only the fields that were provided
    const updates = {};
    if (goalName !== undefined) updates.goalName = goalName.trim();
    if (targetAmount !== undefined) updates.targetAmount = Number(targetAmount);
    if (priority !== undefined) updates.priority = priority;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided to update.",
      });
    }

    // apply updates - new:true returns updated document
    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    const remainingAmount = Math.max(
      updatedGoal.targetAmount - updatedGoal.savedAmount,
      0,
    );
    const progressPercentage = Math.min(
      ((updatedGoal.savedAmount / updatedGoal.targetAmount) * 100).toFixed(2),
      100,
    );

    res.status(200).json({
      success: true,
      message: "Goal updated successfully!",
      data: {
        id: updatedGoal._id,
        goalName: updatedGoal.goalName,
        targetAmount: updatedGoal.targetAmount,
        savedAmount: updatedGoal.savedAmount,
        remainingAmount,
        progressPercentage: `${progressPercentage}%`,
        priority: updatedGoal.priority,
        deadline: updatedGoal.deadline,
        updatedAt: updatedGoal.updatedAt,
      },
    });
  } catch (error) {
    console.error("Edit Goal Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating goal.",
    });
  }
};

// =============================================================
// FUNCTION 5: deleteGoal
// -------------------------------------------------------------
// Deletes a goal and refunds any saved money back to the wallet.
// Also records the refund as an Income transaction.
//
// Route:  DELETE /api/goals/:id
// Access: Private (requires JWT token)
// =============================================================
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });
    }

    // ownership check
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this goal.",
      });
    }

    const refundAmount = goal.savedAmount;
    const goalName = goal.goalName;

    let wallet = null;
    let transaction = null;

    // only refund if there is actually money saved toward the goal
    if (refundAmount > 0) {
      wallet = await Wallet.findOne({ userID: req.user._id });

      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: "Wallet not found. Cannot refund saved amount.",
        });
      }

      // add saved amount back to wallet
      wallet.balance += refundAmount;
      wallet.UpdatedAt = Date.now();
      await wallet.save();

      // record the refund as Income in transaction history
      transaction = await Transaction.create({
        userID: req.user._id,
        type: "Income",
        amount: refundAmount,
        category: "Goal Refund",
        account: "Bank",
        description: `Refund from deleted goal: "${goalName}"`,
        Date: Date.now(),
      });
    }

    await goal.deleteOne();

    const message =
      refundAmount > 0
        ? `Goal "${goalName}" deleted. Rs. ${refundAmount} has been refunded back to your wallet.`
        : `Goal "${goalName}" deleted successfully. No savings to refund.`;

    res.status(200).json({
      success: true,
      message,
      data: {
        deletedGoal: goalName,
        refundAmount,
        ...(wallet && { wallet: { newBalance: wallet.balance } }),
        ...(transaction && {
          transaction: {
            id: transaction._id,
            type: transaction.type,
            amount: transaction.amount,
            category: transaction.category,
            description: transaction.description,
            date: transaction.Date,
          },
        }),
      },
    });
  } catch (error) {
    console.error("Delete Goal Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting goal.",
    });
  }
};

module.exports = { saveGoal, getGoals, addSaving, editGoal, deleteGoal };
