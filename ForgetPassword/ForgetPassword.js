const userModel = require("../Models/user.model");
const bcrypt = require("bcryptjs");
const validatePassword = require("../Validation/password.validation");
const z = require("zod");
const generateOTP = require("../OTP/generateOTP");
const emailHandler = require("../EmailWiring/email.wiring");
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
    const otp= await generateOTP(email)
    // console.log("otp is otp",otp)
    // console.log("hello world")
    await emailHandler.ForgetPassword(checkEmail, otp)
    //console.log("Sucessfully")
    return res.status(200).json({
        success:true,
        message:"OTP sended successfully"
    })
} catch (error) {
            return res.status(500).json({
            success:false,
            message:"internal server error in forgetssssssssssssss passssword"
        })
}

}
module.exports= ForgetPassword