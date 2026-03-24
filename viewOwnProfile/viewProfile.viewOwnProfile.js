const userModel = require("../Models/user.model");

const viewProfile= async(req,res)=>{
    const email= req.user.email
    // const finddata= await userModel.findOne({_id:req.user.id})
    // console.log("find data",finddata)

   const finddata= await userModel.findOne({email:req.user.email})

   return  res.status(200).json({
success:true,
message:"user profile",
data:finddata

    })
}
module.exports= viewProfile;
