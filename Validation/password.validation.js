const z= require("zod");
const validatePassword= z.object({
      email: z.string().email("invalid email format"),
      password: z
        .string()
        .min(4, "password must be atleast 4 characters")
        .max(20, "password must not be more than 20 characters")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        ),
})
module.exports= validatePassword