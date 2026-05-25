const z = require("zod");

const MAX_TRANSACTION_AMOUNT = 10000000;
const MAX_NOTE_LENGTH = 160;

const transactionDate = z.coerce
  .date({ error: "Enter a valid date" })
  .refine((date) => date <  new Date(), "Date cannot be in the future");

const validateExpense = z.object({
  type: z.enum(["Income", "Expense"], {
    error: "Type must be Income or Expense",
  }),
  amount: z
    .number({ error: "Amount must be a number" })
    .positive("Money must be greater than RS 0")
    .max(
      MAX_TRANSACTION_AMOUNT,
      `Money must be less than or equal to RS ${MAX_TRANSACTION_AMOUNT}`,
    ),
  category: z
    .string({ error: "Category is required" })
    .trim()
    .min(2, "Category must be at least 2 characters")
    .max(40, "Category must be 40 characters or less")
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9\s&'/-]*$/, {
      message: "Category contains invalid characters",
    }),
  account: z.enum(["Cash", "Bank"], {
    error: "Account must be Cash or Bank",
  }),
  description: z
    .string({ error: "Description must be text" })
    .trim()
    .max(MAX_NOTE_LENGTH, `Description must be ${MAX_NOTE_LENGTH} characters or less`)
    .optional()
    .default(""),
  date: transactionDate.optional(),
  Date: transactionDate.optional(),
});

module.exports = validateExpense;
