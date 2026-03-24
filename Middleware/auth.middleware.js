const jwt= require("jsonwebtoken")
const userModel = require("../Models/user.model")
const Authentication= async(req,res,next)=>{
try {
    const token= (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies['Cookie-token']
    if(!token){
res.status(400).json({
    success:false,
    message:"unauthorized, token not found"
})
    }

// veryifying the token
const verifytoken= jwt.verify(token,process.env.ACCESS_TOKEN_SECERET_KEY)
console.log(verifytoken)
if(!verifytoken){
   return  res.status(400).json({
    success:false,
    message:"unauthorized, token not verified"
})


}

//  check if user is not found from this id or not 
const userdata= await userModel.findById(verifytoken.id)
if(!userdata){
 return  res.status(400).json({
    success:false,
    message:"unauthorized, user is not found with this id"
})
}
req.user=userdata
 next()
  
} catch (error) {
   return  res.status(400).json({
    success:false,
    message:"internal server error in authentication"
}) 
}
}
module.exports= Authentication