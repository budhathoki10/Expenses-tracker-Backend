const otpEmailTemplate = (user) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Your OTP Code</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <table width="100%" style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 20px;">
      <tr>
        <td style="text-align: center;">
          <h2 style="color: #333;">Verification Code</h2>
          <p style="color: #555; font-size: 16px;">
            Hello <strong>${user.userName}</strong>,
          </p>
          <p style="color: #555; font-size: 16px;">
            Your one-time password (OTP) is:
          </p>
          <h1 style="color: #2c3e50; letter-spacing: 4px; margin: 20px 0;">
            ${user.OTP}
          </h1>
          <p style="color: #555; font-size: 14px;">
            This code will expire in <strong>1 hour</strong>. Please use it to complete your verification process.
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px;">
            Do not share this code with anyone. If you did not request this, please ignore this email.
          </p>
          <p style="color: #555; font-size: 14px; margin-top: 20px;">
            Thank you,<br>
            <strong>Expense Tracker Application</strong>
          </p>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

module.exports = otpEmailTemplate;