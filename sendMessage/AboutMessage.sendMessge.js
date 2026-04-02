const emailHandler = require("../EmailWiring/email.wiring");
const validateMessage = require("../Validation/sendMessage.validation");
const z = require("zod");
const sendPersonalMessage = async (req, res) => {
  const parsedData = validateMessage.parse(req.body);
  const { userName, email, message } = parsedData;

  try {
      await emailHandler.sendPersonalEmails(userName, email, message);
      console.log("hello")
    return res.status(200).json({
      success: true,
      message: "Message send sucessfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(500).json({
        status: "internal server error",
        errors: error.issues.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }


    return res.status(500).json({
      success: false,
      message: "internal server error in sending message",
    });
  }
};
module.exports = sendPersonalMessage;
