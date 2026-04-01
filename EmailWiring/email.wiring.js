const otpEmailTemplate = require("../Email/OTPtemplate.Email");
const sendEmail = require("../utils/nodemailer.utils");
const expenseEmailTemplate = require("../Email/ExpeseTemplate.email");
const incomeEmailTemplate = require("../Email/IncomeTemplate");
const emailHandler= {

    sendOTP:async (user)=>{
        const content= otpEmailTemplate(user)
        await sendEmail(user.email, "OTP", content);
    },
    ExpenseEmail:async(populatedData, findWallet)=>{
        const content = expenseEmailTemplate(populatedData, findWallet);
        await sendEmail(populatedData?.userID?.email, "Expense Added", content);
    },
    IncomeEmail:async(populatedData, findWallet)=>{
        const content = incomeEmailTemplate(populatedData, findWallet);
        await sendEmail(populatedData?.userID?.email, "Income Added", content);
    }




}
module.exports = emailHandler;