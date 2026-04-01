const transporter = require("../Nodemailer/sendemail.Nodemailer");
// const otpEmailTemplate = require("../Email/OTPtemplate.Email");
const sendEmail = async (email, subject, content) => {
  try {
    console.log("sending emailto",email)
    const template = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: content,
    };
    // console.log("SMTP user:", process.env.EMAIL_USER);
    // console.log("SMTP pass:", process.env.EMAIL_PASS);

    console.log("before");
    await transporter.sendMail(template);
    // console.log("Email sent:", info);

    console.log("sended email");
    return { success: true, message: "email send sucessfully" };
  } catch (error) {
    console.error("send email error:", error);
    return { success: false, message: "internal server error" };
  }
};
module.exports = sendEmail;
