const mongoose = require("mongoose");
const WalletsSchema = mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  balance: {
    type: Number,
    require: true,
    default: 0,
  },
  UpdatedAt: {
    type: Date,
    default: Date.now,
  },
});
const walletModel = mongoose.model("Wallet", WalletsSchema);
module.exports = walletModel;
