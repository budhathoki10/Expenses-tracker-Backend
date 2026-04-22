const userModel = require("../Models/user.model");
const bcrypt = require("bcryptjs");
const validatePassword = require("../Validation/password.validation");
const z= require("zod")

const ChangePassword = async (req, res) => {
  try {
    const parsedData = validatePassword.parse(req.body);
    const { email, password,confirmpassword} = parsedData;
    
    const data= await userModel.findOne({email:email})
    if(!data){
      return res.status(401).json({
        success: false,
        message: "Cannot find the password",
      });
    }
    
    if(data.OTP!=null){
      return res.status(400).json({
        message: "please verify your otp first",
      });
    }
    
    if (password != confirmpassword) {
      return res.status(401).json({
        success: false,
        message: "Conform password must be same as Password",
      });
    }
    const newHashedPassword= await bcrypt.hash(password,10)
    data.password=newHashedPassword
    await data.save()
    // console.log("hahahahah")
       return res.status(200).json({
        success: true,
        message: "Password changed successfully",
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
      message: "internal server error in forget password",
    });
  }
};

module.exports= ChangePassword