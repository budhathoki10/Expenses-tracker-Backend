// const transporter = require("../Nodemailer/sendemail.Nodemailer");
// const otpEmailTemplate = require("../Email/OTPtemplate.Email");
// const sendEmail = async (email, subject, content) => {
//   try {
//     console.log("sending emailto",email)
//     const template = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: subject,
//       html: content,
//     };
//     // console.log("SMTP user:", process.env.EMAIL_USER);
//     // console.log("SMTP pass:", process.env.EMAIL_PASS);

//     console.log("before");
//     await transporter.sendMail(template);
//     // console.log("Email sent:", info);

//     console.log("sended email");
//     return { success: true, message: "email send sucessfully" };
//   } catch (error) {
//     console.error("send email error:", error);
//     return { success: false, message: "internal server error" };
//   }
// };


// const { Resend } = require('resend');
// const resend = new Resend(process.env.RESEND_API_KEY);

// const sendEmail = async (email, subject, content) => {
//   try {
//     const data = await resend.emails.send({
//       from: 'onboarding@resend.dev',   // free sender
//       to: email,                      // 👈 any user's email
//       subject: subject,
//       html: content,
//     });
//     console.log('Email sent:', data);
//   } catch (error) {
//     console.error('Email error:', error);
//   }
// };

// const sendPersonalEmail = async (email, subject, content) => {
//   try {
//     // console.log("sending emailto",email)
//     const template = {
//       from: email,
//       to: process.env.EMAIL_USER,
//       subject: subject,
//       html: content,
//     };
//     // console.log("SMTP user:", process.env.EMAIL_USER);
//     // console.log("SMTP pass:", process.env.EMAIL_PASS);

//     console.log("before");
//     await transporter.sendMail(template);
//     // console.log("Email sent:", info);

//     console.log("sended email");
//     return { success: true, message: "email send sucessfully" };
//   } catch (error) {
//     console.error("send email error:", error);
//     return { success: false, message: "internal server error" };
//   }
// };

// module.exports = {sendEmail,sendPersonalEmail};


const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (email, subject, content) => {
  try {
    console.log("sending email to", email);
    const data = await resend.emails.send({
      from: 'budhathokikushal170@gmail.com',
      to: email,
      subject: subject,
      html: content,
    });
    console.log('Email sent:', data);
    return { success: true, message: "email sent successfully" };
  } catch (error) {
    console.error('send email error:', error);
    return { success: false, message: "internal server error" };
  }
};

const sendPersonalEmail = async (email, subject, content) => {
  try {
    console.log("sending personal email from", email);
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.EMAIL_USER,
      subject: subject,
      html: content,
      replyTo: email,
    });
    console.log('Personal email sent:', data);
    return { success: true, message: "email sent successfully" };
  } catch (error) {
    console.error('send personal email error:', error);
    return { success: false, message: "internal server error" };
  }
};

module.exports = { sendEmail, sendPersonalEmail };
