// importing all the library files
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");

const register = require("./routes/register.route");
const verifyOTP = require("./routes/verifyOTP.route");
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
// app.use(cors())
// allow the cors so that frontend can integrate api
const allowedOrigins = ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

configureGoogleAuth();

// using all the route with prefix api
app.use("/api", register);
app.use("/api", verifyOTP);
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

// listening all the request on port number 5000
app.listen(process.env.PORT, () => {
  console.log("Server running at http://localhost:5000");
});
