const { success } = require("zod");
const userModel = require("../Models/user.model");
const bcrypt= require("bcryptjs");
const validate = require("../Validation/register.validation");
const z= require('zod');
const validatePassword = require("../Validation/password.validation");

const createPassword= async(req,res)=>{
try {
    // frontenders please send the email and password in body while fetching this api
    // you can send password from input field and you can get email via profile.emails[0].value



   const parsedData = validatePassword.parse(req.body);


    const {email,password}= parsedData
const checkemail= await userModel.findOne({email:email})
if(!checkemail){
return res.status(400).json({
    success:false,
    message:"this email is not registered via google login"
})
}

if(checkemail.password !=null){
return res.status(400).json({
    success:false,
    message:"password is set already"
})
}
const hashedPassword= await bcrypt.hash(password,10)
const data= await userModel.findOneAndUpdate(
    { email: email },
    { password: hashedPassword },
    { new: true }  
)
return res.status(200).json({
    success:true,
    message:"password set sucessfully",
    user:data
})



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
}
}
module.exports= createPassword