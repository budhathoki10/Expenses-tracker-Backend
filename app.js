// importing all the library files
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");

const register = require("./routes/register.route");
const login = require("./routes/login.routes");
const loginWithGoogle = require("./routes/LoginWithGoogle.routes");
const LogoutRouters = require("./routes/Logout.routes");
const configureGoogleAuth = require("./LoginWithGoogle/google.loginWithGoogle");
const viewWallet = require("./routes/viewWallet.route");
const viewExpenses = require("./routes/viewExpenses.route");
const expensesMoney = require("./routes/expenses.route");
const deleteExpenseRoute = require("./routes/deleteexpense.route");
const updateExpenseRoute = require("./routes/updateexpense.route");
const sendMessage = require("./routes/sendMessage.route");
const filterRoute = require("./routes/filter.route");
const goalRoutes = require("./routes/goal.routes");
const filterExpensesRoute = require("./routes/filterExpenses.route");
const downlaod = require("./routes/downloadReport.route");
const forgetpassword= require("./routes/ForgetPassword.routes")
const DashboardAIRoute= require("./routes/DashbaordAI.route")
const SummaryDataRoute= require("./routes/SummaryData.route")
const monthlySummaryRoute = require("./routes/monthlySummary.route");
const voiceCommandRoute = require("./routes/voiceCommand.route");
const ExpensesModel = require("./Models/expenses.models");

const app = express();

app.use(express.json());
app.use(cookieParser());

// connect the data to mongodb
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Successfully connected to MongoDB"))
  .catch((error) => console.log("Error connecting to MongoDB:", error));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  }),
);
// allow the cors so that frontend can integrate api
const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "https://expensetracker-azure-two.vercel.app",
];
const configuredAllowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  process.env.CORS_ORIGIN,
  process.env.CORS_ALLOWED_ORIGINS,
]
  .flatMap((origin) => String(origin || "").split(","))
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...configuredAllowedOrigins])];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

configureGoogleAuth();

// using all the route with prefix api
app.use("/api", register);
app.use("/api", login);
app.use("/api", LogoutRouters);
app.use("/api", loginWithGoogle);
app.use("/api", viewWallet);
app.use("/api", expensesMoney);
app.use("/api", deleteExpenseRoute);
app.use("/api", updateExpenseRoute);
app.use("/api", sendMessage);
app.use("/api", viewExpenses);
app.use("/api", filterRoute);
app.use("/api", goalRoutes);
app.use("/api", filterExpensesRoute);
app.use("/api", downlaod);
app.use("/api", forgetpassword);
app.use("/api", DashboardAIRoute);
app.use("/api", SummaryDataRoute);
app.use("/api", monthlySummaryRoute);
app.use("/api", voiceCommandRoute);
// listening all the request on specified port or fallback to 5000
// app.post("/api/test", async(req, res) => {
//   await ExpensesModel.insertMany([

//   // ────────────── JANUARY ──────────────
//   // Income
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Income",  amount: 5000, category: "Salary",        account: "Bank", Date: new Date("2026-01-01T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Income",  amount: 1200, category: "Freelance",      account: "Cash", Date: new Date("2026-01-15T00:00:00.000Z") },
//   // Expense
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 1500, category: "Rent",           account: "Bank", Date: new Date("2026-01-01T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 600,  category: "Food",           account: "Cash", Date: new Date("2026-01-05T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 300,  category: "Travel",         account: "Cash", Date: new Date("2026-01-10T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 800,  category: "Clothes",        account: "Cash", Date: new Date("2026-01-15T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 200,  category: "Health",         account: "Bank", Date: new Date("2026-01-20T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 400,  category: "Entertainment",  account: "Cash", Date: new Date("2026-01-25T00:00:00.000Z") },

//   // ────────────── FEBRUARY ──────────────
//   // Income
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Income",  amount: 5000, category: "Salary",        account: "Bank", Date: new Date("2026-02-01T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Income",  amount: 800,  category: "Part-time",     account: "Cash", Date: new Date("2026-02-20T00:00:00.000Z") },
//   // Expense
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 1500, category: "Rent",           account: "Bank", Date: new Date("2026-02-01T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 750,  category: "Food",           account: "Cash", Date: new Date("2026-02-05T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 250,  category: "Travel",         account: "Bank", Date: new Date("2026-02-10T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 500,  category: "Clothes",        account: "Cash", Date: new Date("2026-02-14T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 350,  category: "Health",         account: "Bank", Date: new Date("2026-02-20T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 600,  category: "Entertainment",  account: "Cash", Date: new Date("2026-02-25T00:00:00.000Z") },

//   // ────────────── MARCH ──────────────
//   // Income
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Income",  amount: 5000, category: "Salary",        account: "Bank", Date: new Date("2026-03-01T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Income",  amount: 1500, category: "Bonus",         account: "Bank", Date: new Date("2026-03-15T00:00:00.000Z") },
//   // Expense
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 1500, category: "Rent",           account: "Bank", Date: new Date("2026-03-01T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 900,  category: "Food",           account: "Cash", Date: new Date("2026-03-05T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 400,  category: "Travel",         account: "Cash", Date: new Date("2026-03-10T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 650,  category: "Clothes",        account: "Cash", Date: new Date("2026-03-15T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 300,  category: "Health",         account: "Bank", Date: new Date("2026-03-20T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 450,  category: "Entertainment",  account: "Cash", Date: new Date("2026-03-25T00:00:00.000Z") },

//   // ────────────── APRIL ──────────────
//   // Income
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Income",  amount: 5000, category: "Salary",        account: "Bank", Date: new Date("2026-04-01T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Income",  amount: 2000, category: "Freelance",     account: "Cash", Date: new Date("2026-04-15T00:00:00.000Z") },
//   // Expense
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 150,  category: "Food",           account: "Cash", Date: new Date("2026-03-30T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 200,  category: "Travel",         account: "Cash", Date: new Date("2026-03-31T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 350,  category: "Clothes",        account: "Cash", Date: new Date("2026-04-01T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 100,  category: "Food",           account: "Cash", Date: new Date("2026-04-02T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 500,  category: "Entertainment",  account: "Cash", Date: new Date("2026-04-03T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 250,  category: "Food",           account: "Cash", Date: new Date("2026-04-04T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 180,  category: "Travel",         account: "Cash", Date: new Date("2026-04-05T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 1200, category: "Rent",           account: "Bank", Date: new Date("2026-04-06T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 800,  category: "Food",           account: "Cash", Date: new Date("2026-04-07T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 450,  category: "Clothes",        account: "Cash", Date: new Date("2026-04-08T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 300,  category: "Travel",         account: "Bank", Date: new Date("2026-04-10T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 600,  category: "Entertainment",  account: "Cash", Date: new Date("2026-04-12T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 150,  category: "Health",         account: "Bank", Date: new Date("2026-04-14T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 900,  category: "Food",           account: "Cash", Date: new Date("2026-04-16T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 200,  category: "Health",         account: "Bank", Date: new Date("2026-04-18T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 750,  category: "Clothes",        account: "Cash", Date: new Date("2026-04-20T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 400,  category: "Rent",           account: "Bank", Date: new Date("2026-04-22T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 350,  category: "Travel",         account: "Cash", Date: new Date("2026-04-25T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 500,  category: "Food",           account: "Cash", Date: new Date("2026-04-28T00:00:00.000Z") },

//   // ────────────── MAY 1–16 ──────────────
//   // Income
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Income",  amount: 5000, category: "Salary",        account: "Bank", Date: new Date("2026-05-01T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Income",  amount: 1000, category: "Part-time",     account: "Cash", Date: new Date("2026-05-10T00:00:00.000Z") },
//   // Expense
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 1500, category: "Rent",           account: "Bank", Date: new Date("2026-05-01T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 400,  category: "Food",           account: "Cash", Date: new Date("2026-05-03T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 200,  category: "Travel",         account: "Cash", Date: new Date("2026-05-05T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 150,  category: "Health",         account: "Bank", Date: new Date("2026-05-08T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 300,  category: "Entertainment",  account: "Cash", Date: new Date("2026-05-12T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 250,  category: "Clothes",        account: "Cash", Date: new Date("2026-05-15T00:00:00.000Z") },

//   // ────────────── THIS WEEK: MAY 17–19 ──────────────
//   // Income
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Income",  amount: 500,  category: "Freelance",     account: "Cash", Date: new Date("2026-05-17T00:00:00.000Z") },
//   // Expense
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 150,  category: "Food",           account: "Cash", Date: new Date("2026-05-17T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 100,  category: "Travel",         account: "Cash", Date: new Date("2026-05-18T00:00:00.000Z") },
//   { userID: "6a0dc6d42d4f8bb39b449561", type: "Expense", amount: 200,  category: "Food",           account: "Cash", Date: new Date("2026-05-19T00:00:00.000Z") },

// ]);
// return res.json({ message: "Test data inserted successfully" })
// }
// );

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
