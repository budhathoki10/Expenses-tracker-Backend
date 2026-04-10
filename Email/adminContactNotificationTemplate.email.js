const adminContactNotificationTemplate = (userName, email, message) => {
  // data: { name, email, subject, message, submittedAt }
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Contact Query</title>
</head>
<body style="
  margin: 0;
  padding: 0;
  background-color: #f0ede8;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0ede8; padding: 40px 0;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        ">

          <!-- Header -->
          <tr>
            <td style="
              background: linear-gradient(135deg, #2d6a3f 0%, #3d8c54 100%);
              padding: 36px 40px;
              text-align: center;
            ">
              <p style="
                margin: 0 0 8px 0;
                font-size: 28px;
                font-weight: 700;
                font-style: italic;
                color: #ffffff;
                font-family: Georgia, serif;
                letter-spacing: -0.5px;
              ">Spend Wise</p>
              <p style="
                margin: 0;
                font-size: 13px;
                color: rgba(255,255,255,0.75);
                letter-spacing: 0.3px;
              ">Admin Panel · Support Notification</p>
            </td>
          </tr>

          <!-- Badge + Title -->
          <tr>
            <td style="padding: 36px 40px 0; text-align: center;">
              <div style="
                display: inline-block;
                background-color: #fff7ed;
                border-radius: 50%;
                width: 64px;
                height: 64px;
                line-height: 64px;
                text-align: center;
                font-size: 28px;
                margin-bottom: 16px;
              ">🔔</div>
              <h1 style="
                margin: 0 0 8px;
                font-size: 22px;
                font-weight: 700;
                color: #111827;
              ">New Query Received</h1>
              <p style="
                margin: 0;
                font-size: 14px;
                color: #6b7280;
                line-height: 1.6;
              ">
                A user has submitted a query from the landing page.<br/>
                <strong style="color: #2d6a3f;">Please review and respond at your earliest convenience.</strong>
              </p>
            </td>
          </tr>

          <!-- Alert Banner -->
          <tr>
            <td style="padding: 20px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="
                background-color: #fff7ed;
                border-radius: 10px;
                border-left: 4px solid #f97316;
                padding: 14px 18px;
              ">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 13px; color: #92400e;">
                      ⏱️ <strong>Action Required:</strong> Respond to this query within 24–48 hours as per support policy.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sender Details Card -->
          <tr>
            <td style="padding: 28px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="
                background-color: #f9fafb;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
                overflow: hidden;
              ">
                <tr>
                  <td style="
                    padding: 16px 20px;
                    border-bottom: 1px solid #e5e7eb;
                    background-color: #f3f4f6;
                  ">
                    <p style="margin: 0; font-size: 12px; font-weight: 700; color: #9ca3af; letter-spacing: 1px; text-transform: uppercase;">Sender Information</p>
                  </td>
                </tr>

                <!-- Name -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 13px; color: #6b7280;">👤 Full Name</td>
                        <td align="right" style="font-size: 13px; font-weight: 600; color: #111827;">${userName || 'N/A'}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Email -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 13px; color: #6b7280;">📧 Email Address</td>
                        <td align="right">
                          <a href="mailto:${email || ''}" style="
                            font-size: 13px;
                            font-weight: 600;
                            color: #2d6a3f;
                            text-decoration: none;
                          ">${email || 'N/A'}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Subject -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 13px; color: #6b7280;">📌 Subject</td>
                        <td align="right">
                          <span style="
                            font-size: 12px;
                            font-weight: 700;
                            color: #1d4ed8;
                            background-color: #eff6ff;
                            padding: 3px 10px;
                            border-radius: 20px;
                          "> 'General Inquiry'</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Submitted At -->
                <tr>
                  <td style="padding: 14px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 13px; color: #6b7280;">📅 Submitted On </td>
                        <td align="right" style="font-size: 13px; font-weight: 600; color: #111827;">${ new Date().toDateString()} </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Message Body Card -->
          <tr>
            <td style="padding: 20px 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="
                background-color: #f9fafb;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
                overflow: hidden;
              ">
                <tr>
                  <td style="
                    padding: 16px 20px;
                    border-bottom: 1px solid #e5e7eb;
                    background-color: #f3f4f6;
                  ">
                    <p style="margin: 0; font-size: 12px; font-weight: 700; color: #9ca3af; letter-spacing: 1px; text-transform: uppercase;">💬 Message</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 20px;">
                    <p style="
                      margin: 0;
                      font-size: 14px;
                      color: #374151;
                      line-height: 1.8;
                      white-space: pre-line;
                    ">${message || 'No message provided.'}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Reply CTA -->
          <tr>
            <td style="padding: 0 40px 28px; text-align: center;">
              <a href="mailto:${email || ''}?subject=Re: ${encodeURIComponent('Your Inquiry - Spend Wise')}" style="
                display: inline-block;
                background: linear-gradient(135deg, #2d6a3f 0%, #3d8c54 100%);
                color: #ffffff;
                font-size: 14px;
                font-weight: 700;
                text-decoration: none;
                padding: 14px 36px;
                border-radius: 8px;
                letter-spacing: 0.3px;
              ">Reply to ${userName || 'User'} →</a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 12px; color: #9ca3af;">
                This is an automated admin notification from Spend Wise.
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} Spend Wise. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        <!-- End Card -->

      </td>
    </tr>
  </table>

</body>
</html>
  `;
};

module.exports = adminContactNotificationTemplate;