const z = require("zod");
const validate = z.object({
  userName: z.string().min(2, "user name must have at least 2 character"),
  email: z.string().email("invalid email format"),
  password: z
    .string()
    .min(4, "password must be atleast 4 characters")
    .max(12, "password must not be more than 12 character")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
});
module.exports = validate;
