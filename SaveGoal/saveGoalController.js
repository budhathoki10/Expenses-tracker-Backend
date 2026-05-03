/*
  This file handles all the backend logic for the goal-based savings feature
  of the SpendWise expense tracker app.
 
  It includes 5 main functions:
  saveGoal    - creates a new savings goal for the logged-in user
  getGoals    - fetches all goals belonging to the logged-in user
  addSaving   - deposits money into a goal (checks wallet balance first)
  editGoal    - updates an existing goal's details
  deleteGoal  - deletes a goal and refunds any saved money back to wallet
 
  All functions are async and use try/catch for error handling.
  All routes are protected meaning the user must be logged in (JWT token required).
 */

// importing the models we need to interact with the database
const Goal = require("../Models/goals.model");
const Wallet = require("../Models/wallet.model");
const Transaction = require("../Models/expenses.models");

// FUNCTION 1: saveGoal

// This function creates a new financial goal for the user.
// The user sends goalName, targetAmount, , priority,
// and deadline in the request body.
// We validate all fields before saving to the database.

const saveGoal = async (req, res) => {
  try {
    // pulling out the fields from the request body
    const { goalName, targetAmount, priority, deadline } = req.body;

    // check if all required fields are present
    // if any of them are missing we send back a 400 Bad Request error
    if (!goalName || !targetAmount || !priority || !deadline) {
      return res.status(400).json({
        success: false,
        message:
          "goalName, targetAmount, priority, and deadline are all required.",
      });
    }

    // make sure targetAmount is actually a number and greater than 0
    // isNaN() returns true if the value is not a number
    if (isNaN(targetAmount) || Number(targetAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "targetAmount must be a positive number.",
      });
    }

 
    // priority must be one of these 3 values only
    // low = not urgent, medium = somewhat urgent, high = very urgent
    const validPriorities = ["low", "medium", "high"];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "priority must be one of: low, medium, high.",
      });
    }

    // convert the deadline string to a JavaScript Date object
    // then check if its a real date and if its in the future
    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      // getTime() returns NaN if the date is invalid
      return res.status(400).json({
        success: false,
        message: "deadline must be a valid date (e.g. 2025-12-31).",
      });
    }
    if (parsedDeadline <= new Date()) {
      // comparing deadline to right now - it must be in the future
      return res.status(400).json({
        success: false,
        message: "deadline must be a future date.",
      });
    }

    // all validations passed so now we create the new goal
    // req.user._id comes from the auth middleware (the logged-in user's ID)
    const newGoal = new Goal({
      userId: req.user._id,
      goalName: goalName.trim(), // trim() removes any extra spaces
      targetAmount: Number(targetAmount),
     
      priority,
      deadline: parsedDeadline,
    });

    // save the goal to MongoDB
    await newGoal.save();

    // send back a success response with the created goal data
    // savedAmount starts at 0 and remainingAmount equals targetAmount at creation
    res.status(201).json({
      success: true,
      message: "Goal saved successfully!",
      data: {
        id: newGoal._id,
        goalName: newGoal.goalName,
        targetAmount: newGoal.targetAmount,
        savedAmount: newGoal.savedAmount, // will be 0 at creation
        remainingAmount: newGoal.targetAmount, // full amount remaining at start
        progressPercentage: "0.00%", // 0% progress at creation
      
        priority: newGoal.priority,
        deadline: newGoal.deadline,
        createdAt: newGoal.createdAt,
      },
    });
  } catch (error) {
    // if something unexpected goes wrong on the server side
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
// This function fetches all goals that belong to the logged-in user.
// It also calculates remainingAmount and progressPercentage for
// each goal on the fly before sending them to the frontend.
//
// Route:  GET /api/goals
// Access: Private (requires JWT token)
// =============================================================
const getGoals = async (req, res) => {
  try {
    // find all goals where userId matches the logged-in user
    // sort by createdAt: -1 means newest goals come first
    const goals = await Goal.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    // if no goals found, return an empty array with a helpful message
    if (goals.length === 0) {
      return res.status(200).json({
        success: true,
        message: "You have no goals yet. Start by creating one!",
        data: [],
      });
    }

    // loop through each goal and add calculated fields
    // the frontend needs these values to display progress bars etc.
    const goalsWithProgress = goals.map((goal) => {
      // Math.max ensures remaining amount never goes below 0
      const remainingAmount = Math.max(goal.targetAmount - goal.savedAmount, 0);

      // calculate percentage saved, capped at 100% using Math.min
      // toFixed(2) rounds to 2 decimal places e.g. 66.67
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
        progressPercentage: `${progressPercentage}%`, // e.g. "66.67%"
     
        priority: goal.priority,
        deadline: goal.deadline,
        createdAt: goal.createdAt,
      };
    });

    // send back all goals with the count so frontend knows how many there are
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
// This function deposits money into a specific goal.
// Before depositing it:
//   - Checks the wallet has enough balance
//   - Deducts the amount from the wallet
//   - Adds the amount to the goal's savedAmount
//   - Records a transaction in the Transaction collection
//
// Route:  POST /api/goals/:id/add-saving
// Access: Private (requires JWT token)
// =============================================================
const addSaving = async (req, res) => {
  try {
    // get the deposit amount, optional note, and account type from request body
    const { amount, note, account } = req.body;

    // step 1: make sure amount is a valid positive number
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid positive amount.",
      });
    }

    // step 2: account must be either Cash or Bank
    // this matches the enum in the Transaction (expenses) model
    const validAccounts = ["Cash", "Bank"];
    if (!account || !validAccounts.includes(account)) {
      return res.status(400).json({
        success: false,
        message: "Please specify account: Cash or Bank.",
      });
    }

    // step 3: find the goal using the ID from the URL params
    // e.g. /api/goals/665abc123/add-saving → req.params.id = "665abc123"
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });
    }

    // step 4: make sure this goal actually belongs to the logged-in user
    // we convert both IDs to strings before comparing because MongoDB IDs are objects
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to add savings to this goal.",
      });
    }

    // step 5: check if the goal is already completed
    // no point depositing more money into a finished goal
    if (goal.savedAmount >= goal.targetAmount) {
      return res.status(400).json({
        success: false,
        message: `This goal is already completed! No more deposits needed.`,
      });
    }

    // step 6: find the users wallet and check they have enough balance
    const wallet = await Wallet.findOne({ userID: req.user._id });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found. Please set up your wallet first.",
      });
    }

    // if wallet balance is less than the deposit amount, reject the request
    if (wallet.balance < Number(amount)) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Your wallet has Rs.${wallet.balance} but you tried to deposit Rs.${amount}.`,
      });
    }

    // step 7: deduct the deposit amount from the wallet
    const previousBalance = wallet.balance; // save old balance for the response
    wallet.balance -= Number(amount);
    wallet.UpdatedAt = Date.now();
    await wallet.save();

    // step 8: add the deposit amount to the goals savedAmount
    goal.savedAmount += Number(amount);
    await goal.save();

    // step 9: record this deposit as a transaction in the Transaction collection
    // type is "Expense" because money is leaving the wallet
    // category is "Goal Saving" so it shows clearly in transaction history
    const transaction = await Transaction.create({
      userID: req.user._id,
      type: "Expense",
      amount: Number(amount),
      category: "Goal Saving",
      account,
      // if user added a note use it, otherwise use a default description
      description: note
        ? `Goal: ${goal.goalName} — ${note}`
        : `Goal saving: ${goal.goalName}`,
      Date: Date.now(),
    });

    // step 10: calculate the updated progress to send back to frontend
    const remainingAmount = Math.max(goal.targetAmount - goal.savedAmount, 0);
    const progressPercentage = Math.min(
      ((goal.savedAmount / goal.targetAmount) * 100).toFixed(2),
      100,
    );
    // check if this deposit completed the goal
    const isCompleted = goal.savedAmount >= goal.targetAmount;

    // send back success response with goal progress, wallet update, and transaction info
    res.status(200).json({
      success: true,
      // show a congratulations message if goal is now complete
      message: isCompleted
        ? ` Congratulations! You completed your goal: "${goal.goalName}"!`
        : ` Rs.${amount} added to "${goal.goalName}". Rs.${remainingAmount} remaining.`,
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
          previousBalance, // what the balance was before
          amountDeducted: Number(amount),
          newBalance: wallet.balance, // what the balance is now
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
// This function lets the user update any of their goal's details.
// Only the fields that are sent in the request body get updated.
// Fields not included in the request stay unchanged.
//
// Route:  PUT /api/goals/:id
// Access: Private (requires JWT token)
// =============================================================
const editGoal = async (req, res) => {
  try {
    // find the goal by ID from the URL
    const goal = await Goal.findById(req.params.id);

    // return 404 if goal doesnt exist
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });
    }

    // make sure the goal belongs to the logged-in user before allowing edits
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this goal.",
      });
    }

    // pull out the fields the user wants to update from the request body
    // any of these can be undefined if user didn't include them
    const { goalName, targetAmount, priority, deadline } = req.body;

    // only validate fields that were actually sent
    // we use "!== undefined" to check if the field exists in the request

    // validate targetAmount only if it was sent
    if (targetAmount !== undefined) {
      if (isNaN(targetAmount) || Number(targetAmount) <= 0) {
        return res.status(400).json({
          success: false,
          message: "targetAmount must be a positive number.",
        });
      }
    }

   

    // validate priority only if it was sent
    if (priority !== undefined) {
      const validPriorities = ["low", "medium", "high"];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "priority must be one of: low, medium, high.",
        });
      }
    }

    // validate deadline only if it was sent
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

    // build the updates object with only the fields that were provided
    // this way we dont accidentally overwrite fields with undefined
    const updates = {};
    if (goalName !== undefined) updates.goalName = goalName.trim();
    if (targetAmount !== undefined) updates.targetAmount = Number(targetAmount);

    if (priority !== undefined) updates.priority = priority;
    if (deadline !== undefined) updates.deadline = new Date(deadline);

    // if the updates object is empty, the user didn't send any valid fields
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided to update.",
      });
    }

    // apply the updates to the goal in the database
    // new: true returns the updated document instead of the old one
    // runValidators: true runs the schema validation on updated fields
    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    // recalculate progress with the updated values
    const remainingAmount = Math.max(
      updatedGoal.targetAmount - updatedGoal.savedAmount,
      0,
    );
    const progressPercentage = Math.min(
      ((updatedGoal.savedAmount / updatedGoal.targetAmount) * 100).toFixed(2),
      100,
    );

    // send back the updated goal data
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

// FUNCTION 5: deleteGoal

// This function deletes a goal and handles the refund logic.
// If the user had already saved some money toward the goal,
// that money gets added back to their wallet automatically.
// A refund transaction is also recorded in the Transaction collection
// so it shows up in the transaction history.
//
// Route:  DELETE /api/goals/:id
// Access: Private (requires JWT token)

const deleteGoal = async (req, res) => {
  try {
    // step 1: find the goal by ID from the URL
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });
    }

    // step 2: make sure the goal belongs to the logged-in user
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this goal.",
      });
    }

    // save these before deleting because we need them for the response later
    const refundAmount = goal.savedAmount; // how much money was saved toward this goal
    const goalName = goal.goalName;

    // step 3: only do the refund process if there is actually money to refund
    // if savedAmount is 0, we skip straight to deleting the goal
    let wallet = null;
    let transaction = null;

    if (refundAmount > 0) {
      // step 4: find the users wallet
      wallet = await Wallet.findOne({ userID: req.user._id });

      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: "Wallet not found. Cannot refund saved amount.",
        });
      }

      // step 5: add the saved amount back to the wallet balance
      // this is the refund - money goes back to the user
      const previousBalance = wallet.balance;
      wallet.balance += refundAmount;
      wallet.UpdatedAt = Date.now();
      await wallet.save();

      // step 6: record the refund as an Income transaction
      // type is "Income" because money is coming back into the wallet
      // category is "Goal Refund" so it shows clearly in transaction history
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

    // step 7: now delete the goal from the database
    await goal.deleteOne();

    // step 8: build a response message depending on whether a refund happened
    const message =
      refundAmount > 0
        ? `Goal "${goalName}" deleted. Rs.${refundAmount} saved amount has been refunded back to your wallet.`
        : `Goal "${goalName}" deleted successfully. No savings to refund.`;

    // send back the response
    // we use spread operator (...) to conditionally include wallet and transaction
    // data only if they exist (i.e. only when a refund happened)
    res.status(200).json({
      success: true,
      message,
      data: {
        deletedGoal: goalName,
        refundAmount,
        // only include wallet info if a refund was made
        ...(wallet && {
          wallet: {
            newBalance: wallet.balance,
          },
        }),
        // only include transaction info if a refund transaction was created
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

// export all functions so they can be used in goal.routes.js
module.exports = { saveGoal, getGoals, addSaving, editGoal, deleteGoal };
