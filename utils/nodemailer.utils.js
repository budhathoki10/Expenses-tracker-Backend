const SibApiV3Sdk = require('sib-api-v3-sdk');

const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async (email, subject, content) => {
  try {
    console.log("sending email to", email);
    await apiInstance.sendTransacEmail({
      sender: { 
        email: process.env.ADMIN_EMAIL,  
        name: 'Expenses Tracker' 
      },
      to: [{ email: email }],          
      subject: subject,
      htmlContent: content,
    });
    console.log('Email sent successfully');
    return { success: true, message: "email sent successfully" };
  } catch (error) {
    console.error('send email error:', error);
    return { success: false, message: "internal server error" };
  }
};

const sendPersonalEmail = async (email, subject, content) => {
  try {
    console.log("sending personal email from", email);
    await apiInstance.sendTransacEmail({
      sender: { 
        email: process.env.ADMIN_EMAIL,   
        name: 'Expenses Tracker' 
      },
      to: [{ email: process.env.ADMIN_EMAIL }],  
      subject: subject,
      htmlContent: content,
      replyTo: { email: email },                
    });
    console.log('Personal email sent successfully');
    return { success: true, message: "email sent successfully" };
  } catch (error) {
    console.error('send personal email error:', error);
    return { success: false, message: "internal server error" };
  }
};

module.exports = { sendEmail, sendPersonalEmail };