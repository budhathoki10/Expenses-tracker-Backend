const z = require("zod");
const validateMessage = z.object({
  userName: z.string().min(2, "user name must have at least 2 character"),
  email: z.string().email("invalid email format"),
  message: z
    .string()
    .min(4, "please enter at least 4 character")

});
module.exports = validateMessage;
