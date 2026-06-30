const userModel = require("../Models/user.model");
const z = require("zod");
const ForgetPassword= async(req,res)=>{

try {
    const {email}= req.body;
       const emailSchema = z.string().email("Invalid email format");
    const validation = emailSchema.safeParse(email);
        if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "invalid email format",
      });
    }

    const checkEmail= await userModel.findOne({email:email});
// console.log(checkEmail)
    if(!checkEmail){
        return res.status(404).json({
            success:false,
            message:"Cannot find this email"
        }) 
    }

    return res.status(200).json({
        success:true,
        message:"Email verified. Continue to reset password"
    })
} catch (error) {
            return res.status(500).json({
            success:false,
            message:"internal server error in forget password"
        })
}

}
module.exports= ForgetPassword
