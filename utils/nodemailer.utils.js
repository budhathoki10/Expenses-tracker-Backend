const nodemailer = require("nodemailer");
const otpEmailTemplate = require("../Email/OTPtemplate.Email");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.smtpEmail,
    pass: process.env.smtpPassword,
  },
});


const sendEmail = async (email, user) => {
  try {
    console.log("inside send email",email)
       console.log("inside send email user",user)
       const content= otpEmailTemplate(user)
    const template = {
      from: "budhathokikushal170@gmail.com",
      to: email,
      subject: "OTP",
    html: content
  

    };
    console.log("SMTP user:", process.env.smtpEmail);
console.log("SMTP pass:", process.env.smtpPassword);

    console.log("before")
     transporter.sendMail(template);
    // console.log("Email sent:", info);

    console.log('sended email')
  return ({ success: true, message: "email send sucessfully" });
  } catch (error) {
   return ({ success: false, message: "internal server error" });
    
  }
};
module.exports = sendEmail;
