const walletModel = require("../Models/wallet.model");
const viewWallet= async(req,res)=>{
try {
const walletData= await walletModel.findOneAndUpdate(
  { userID: req.user._id },
  {
    $setOnInsert: {
      userID: req.user._id,
      balance: 0,
    },
  },
  {
    returnDocument: "after",
    upsert: true,
    setDefaultsOnInsert: true,
  },
).populate("userID","userName email")
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
