const ForgetPasswordOtpEmailTemplate = (user,otp) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Reset Your Password</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <table width="100%" style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 20px;">
      <tr>
        <td style="text-align: center;">
          <h2 style="color: #333;">🔐 Password Reset Request</h2>
          <p style="color: #555; font-size: 16px;">
            Hello <strong>${user.userName}</strong>,
          </p>
          <p style="color: #555; font-size: 16px;">
            We received a request to reset your password. Use the OTP below to proceed:
          </p>
          <h1 style="color: #e74c3c; letter-spacing: 4px; margin: 20px 0; background: #f8f9fa; padding: 15px; border-radius: 8px;">
            ${otp}
          </h1>
          <p style="color: #555; font-size: 14px;">
            This code will expire in <strong>1 hour</strong>. Enter it on the password reset page to continue.
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #e74c3c; font-size: 13px; font-weight: bold;">
            ⚠️ If you did not request a password reset, please ignore this email. Your account is still secure.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 15px;">
            Do not share this code with anyone, including our support team.
          </p>
          <p style="color: #555; font-size: 14px; margin-top: 20px;">
            Best regards,<br>
            <strong>Expense Tracker Team</strong>
          </p>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

module.exports = ForgetPasswordOtpEmailTemplate;