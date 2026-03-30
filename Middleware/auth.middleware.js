const jwt= require("jsonwebtoken")
const userModel = require("../Models/user.model")
const Authentication= async(req,res,next)=>{
try {
        console.log("=== AUTH HIT ===");
    console.log("URL:", req.url);          // ← add at very top
    console.log("METHOD:", req.method);
    const token= (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies['Cookie-token']
    if(!token){
return res.status(400).json({
    success:false,
    message:"unauthorized, token not found"
})
    }
     console.log("TOKEN:", token);           // ← add this
    console.log("COOKIES:", req.cookies);   // ← add this
    console.log("HEADERS:", req.headers);   // ← add this

// veryifying the token
const verifytoken= jwt.verify(token,process.env.ACCESS_TOKEN_SECERET_KEY)
// console.log(verifytoken)
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