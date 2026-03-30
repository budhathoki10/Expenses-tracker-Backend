const Logout= async(req,res)=>{
try {

    if(req.cookies && req.cookies["Cookie-token"]){
        res.clearCookie("Cookie-token")
        // console.log("the cookie is",req.cookies['Cookie-token'])
        return res.status(200).json({
            success:true,
            message:"Logout sucessfully"
        })
    }
            return res.status(400).json({
            success:false,
            message:"Cookie not found, login first"
        })
   
        
} catch (error) {
    console.log("error faced:", error)
         return res.status(500).json({
            success:false,
            message:"internal server error in logout"
        })
}
    
}
module.exports= Logout
