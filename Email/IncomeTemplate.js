const incomeEmailTemplate = (populatedData, findWallet) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Income Added</title>
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
              background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
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
              ">Where your income grows</p>
            </td>
          </tr>

          <!-- Icon + Title -->
          <tr>
            <td style="padding: 36px 40px 0; text-align: center;">
              <div style="
                display: inline-block;
                background-color: #e0f2fe;
                border-radius: 50%;
                width: 64px;
                height: 64px;
                line-height: 64px;
                text-align: center;
                font-size: 28px;
                margin-bottom: 16px;
              ">💰</div>
              <h1 style="
                margin: 0 0 8px;
                font-size: 22px;
                font-weight: 700;
                color: #111827;
              ">Income Recorded</h1>
              <p style="
                margin: 0;
                font-size: 14px;
                color: #6b7280;
                line-height: 1.6;
              ">
                <strong style="color: #2563eb;">Hi ${populatedData?.userID?.userName},</strong> 
                your income has been successfully added to your account. 
                Your updated balance is <b>$${findWallet.balance}</b>.
              </p>
            </td>
          </tr>

          <!-- Income Details Card -->
          <tr>
            <td style="padding: 28px 40px;">
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
                    <p style="margin: 0; font-size: 12px; font-weight: 700; color: #9ca3af; letter-spacing: 1px; text-transform: uppercase;">Income Details</p>
                  </td>
                </tr>

                <!-- Category -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 13px; color: #6b7280;">📂 Category</td>
                        <td align="right" style="font-size: 13px; font-weight: 600; color: #111827;">${populatedData.category || 'N/A'}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Amount -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 13px; color: #6b7280;">💵 Amount</td>
                        <td align="right">
                          <span style="
                            font-size: 15px;
                            font-weight: 700;
                            color: #16a34a;
                            background-color: #ecfdf5;
                            padding: 3px 10px;
                            border-radius: 20px;
                          ">+ $${populatedData.amount || '0.00'}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Date -->
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 13px; color: #6b7280;">📅 Date</td>
                        <td align="right" style="font-size: 13px; font-weight: 600; color: #111827;">${new Date().toDateString()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Note -->
                <tr>
                  <td style="padding: 14px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 13px; color: #6b7280;">📝 Note</td>
                        <td align="right" style="font-size: 13px; font-weight: 600; color: #111827;">${populatedData.description || 'No note added'}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Tip -->
          <tr>
            <td style="padding: 0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="
                background: linear-gradient(135deg, #e0f2fe, #bae6fd);
                border-radius: 12px;
                padding: 16px 20px;
                border-left: 4px solid #2563eb;
              ">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #2563eb;">💡 Spend Wise Tip</p>
                    <p style="margin: 0; font-size: 12px; color: #374151; line-height: 1.6;">
                      Save a portion of every income you earn. Building reserves ensures financial stability for the future.
                    </p>
                  </td>
                </tr>
              </table>
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
                You received this email because you have an account with Spend Wise.
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} Spend Wise. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `;
};

module.exports = incomeEmailTemplate;