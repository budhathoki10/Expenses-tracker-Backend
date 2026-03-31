const emailTemplate = (data) => {
    return `
    <h1>Expense Added Successfully</h1>
    <p>Dear ${data.userID.userName},</p>
    <p>Your expense has been added successfully.</p>
    `;

}
module.exports = emailTemplate;