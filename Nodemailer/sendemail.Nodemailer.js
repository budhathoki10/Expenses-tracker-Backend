const nodemailer = require("nodemailer");


console.log("EMAIL_USER from transporter:", process.env.EMAIL_USER);
console.log("EMAIL_PASS from transporter:", process.env.EMAIL_USER);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
});

module.exports = transporter;