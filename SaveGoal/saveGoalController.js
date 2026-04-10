const Goal = require("../Models/goals.model");
const Wallet = require("../Models/wallet.model");
const Transaction = require("../Models/expenses.models");

// ─── Save a new goal ───────────────────────────────────────
// @route  POST /api/save-goal
// @access Private
const saveGoal = async (req, res) => {
  try {
    const { goalName, targetAmount, timeframe, priority, deadline } = req.body;

    if (!goalName || !targetAmount || !timeframe || !priority || !deadline) {
      return res.status(400).json({
        success: false,
        message:
          "goalName, targetAmount, timeframe, priority, and deadline are all required.",
      });
    }

    if (isNaN(targetAmount) || Number(targetAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "targetAmount must be a positive number.",
      });
    }

    const validTimeframes = ["weekly", "monthly", "yearly"];
    if (!validTimeframes.includes(timeframe)) {
      return res.status(400).json({
        success: false,
        message: "timeframe must be one of: weekly, monthly, yearly.",
      });
    }

    const validPriorities = ["low", "medium", "high"];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "priority must be one of: low, medium, high.",
      });
    }

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

    const newGoal = new Goal({
      userId: req.user._id,
      goalName: goalName.trim(),
      targetAmount: Number(targetAmount),
      timeframe,
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
        timeframe: newGoal.timeframe,
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

// ─── Get all goals for logged-in user ─────────────────────
// @route  GET /api/goals
// @access Private
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    if (goals.length === 0) {
      return res.status(200).json({
        success: true,
        message: "You have no goals yet. Start by creating one!",
        data: [],
      });
    }

    const goalsWithProgress = goals.map((goal) => {
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
        timeframe: goal.timeframe,
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

// ─── Add money toward a goal ───────────────────────────────
// @route  POST /api/goals/:id/add-saving
// @access Private
const addSaving = async (req, res) => {
  try {
    const { amount, note, account } = req.body;

    // 1. Validate amount
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid positive amount.",
      });
    }

    // 2. Validate account
    const validAccounts = ["Cash", "Bank"];
    if (!account || !validAccounts.includes(account)) {
      return res.status(400).json({
        success: false,
        message: "Please specify account: Cash or Bank.",
      });
    }

    // 3. Find the goal
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });
    }

    // 4. Ownership check
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to add savings to this goal.",
      });
    }

    // 5. Check if goal is already completed
    if (goal.savedAmount >= goal.targetAmount) {
      return res.status(400).json({
        success: false,
        message: `This goal is already completed! No more deposits needed.`,
      });
    }

    // 6. Check wallet balance
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
        message: `Insufficient balance. Your wallet has $${wallet.balance} but you tried to deposit $${amount}.`,
      });
    }

    // 7. Deduct from wallet
    const previousBalance = wallet.balance;
    wallet.balance -= Number(amount);
    wallet.UpdatedAt = Date.now();
    await wallet.save();

    // 8. Add to goal savedAmount
    goal.savedAmount += Number(amount);
    await goal.save();

    // 9. Record in Transaction collection
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

    // 10. Calculate updated progress
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
        : ` $${amount} added to "${goal.goalName}". $${remainingAmount} remaining.`,
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

// ─── Edit a goal ───────────────────────────────────────────
// @route  PUT /api/goals/:id
// @access Private
const editGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this goal.",
      });
    }

    const { goalName, targetAmount, timeframe, priority, deadline } = req.body;

    if (targetAmount !== undefined) {
      if (isNaN(targetAmount) || Number(targetAmount) <= 0) {
        return res.status(400).json({
          success: false,
          message: "targetAmount must be a positive number.",
        });
      }
    }

    if (timeframe !== undefined) {
      const validTimeframes = ["weekly", "monthly", "yearly"];
      if (!validTimeframes.includes(timeframe)) {
        return res.status(400).json({
          success: false,
          message: "timeframe must be one of: weekly, monthly, yearly.",
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

    if (deadline !== undefined) {
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
    }

    const updates = {};
    if (goalName !== undefined) updates.goalName = goalName.trim();
    if (targetAmount !== undefined) updates.targetAmount = Number(targetAmount);
    if (timeframe !== undefined) updates.timeframe = timeframe;
    if (priority !== undefined) updates.priority = priority;
    if (deadline !== undefined) updates.deadline = new Date(deadline);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided to update.",
      });
    }

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
        timeframe: updatedGoal.timeframe,
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

// ─── Delete a goal ─────────────────────────────────────────
// @route  DELETE /api/goals/:id
// @access Private
const deleteGoal = async (req, res) => {
  try {
    // 1. Find the goal
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });
    }

    // 2. Ownership check
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this goal.",
      });
    }

    const refundAmount = goal.savedAmount;
    const goalName = goal.goalName;

    // 3. Only refund if there is actually money saved
    let wallet = null;
    let transaction = null;

    if (refundAmount > 0) {
      // 4. Find the wallet
      wallet = await Wallet.findOne({ userID: req.user._id });

      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: "Wallet not found. Cannot refund saved amount.",
        });
      }

      // 5. Refund the savedAmount back to wallet
      const previousBalance = wallet.balance;
      wallet.balance += refundAmount;
      wallet.UpdatedAt = Date.now();
      await wallet.save();

      // 6. Record the refund as an Income transaction so it shows in transaction history
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

    // 7. Delete the goal
    await goal.deleteOne();

    // 8. Build response message
    const message =
      refundAmount > 0
        ? `Goal "${goalName}" deleted. $${refundAmount} saved amount has been refunded back to your wallet.`
        : `Goal "${goalName}" deleted successfully. No savings to refund.`;

    res.status(200).json({
      success: true,
      message,
      data: {
        deletedGoal: goalName,
        refundAmount,
        ...(wallet && {
          wallet: {
            newBalance: wallet.balance,
          },
        }),
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
