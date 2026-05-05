const walletModel = require("../Models/wallet.model");
const viewWallet= async(req,res)=>{
try {
const finddata= await walletModel.findOne({userID:req.user._id}).populate("userID","userName email")
let walletData = finddata;
if (!walletData) {
  walletData = await walletModel.create({
    userID: req.user._id,
    balance: 0,
  });
  walletData = await walletModel.findById(walletData._id).populate("userID", "userName email");
}
   return  res.status(200).json({
success:true,
message:"User wallet details",
data:walletData

    })
} catch (error) {
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
}
module.exports= viewWallet;
