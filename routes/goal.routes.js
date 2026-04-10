const express = require("express");
const router = express.Router();

const {
  saveGoal,
  getGoals,
  addSaving,
  editGoal,
  deleteGoal,
} = require("../SaveGoal/saveGoalController");
const Authentication = require("../Middleware/auth.middleware");

// POST   /api/save-goal              → Create a new goal
router.post("/save-goal", Authentication, saveGoal);

// GET    /api/goals                  → Get all goals
router.get("/goals", Authentication, getGoals);

// POST   /api/goals/:id/add-saving   → Add money to a goal
router.post("/goals/:id/add-saving", Authentication, addSaving);

// PUT    /api/goals/:id              → Edit a goal
router.put("/goals/:id", Authentication, editGoal);

// DELETE /api/goals/:id              → Delete a goal
router.delete("/goals/:id", Authentication, deleteGoal);

module.exports = router;
