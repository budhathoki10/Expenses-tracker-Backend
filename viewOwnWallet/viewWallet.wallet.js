const walletModel = require("../Models/wallet.model");
const viewWallet= async(req,res)=>{
const finddata= await walletModel.findOne({userID:req.user._id}).populate("userID","userName email")
   return  res.status(200).json({
success:true,
message:"User wallet details",
data:finddata

    })
}
module.exports= viewWallet;
