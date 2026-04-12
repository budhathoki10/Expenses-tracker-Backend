const nodemailer = require("nodemailer");


// console.log("EMAIL_USER from transporter:", process.env.EMAIL_USER);
// console.log("EMAIL_PASS from transporter:", process.env.EMAIL_USER);

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   },
// });
// make sure it looks exactly like this
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   requireTLS: true,   // ← forces STARTTLS upgrade
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   },
//   tls: {
//     rejectUnauthorized: false
//   }
// });

// const transporter = createTransport({
//   host: process.env.SMTP_HOST,
//   port: 587,
//   secure: false, // Set to true for secure connection
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASSWORD,
//   },
// });


module.exports = transporter;