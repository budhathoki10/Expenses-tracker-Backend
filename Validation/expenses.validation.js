const z= require("zod")
const validateExpense= z.object({
    type:z.string(),
    amount:z.number().min(1, "Money must be greater than RS 1"),
    category:z.string(),
    account:z.string(),
    description:z.string()
})
module.exports= validateExpense