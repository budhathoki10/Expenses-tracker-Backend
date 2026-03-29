const mongoose = require("mongoose");
const GoalsSchema = mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  targetAmount:{
    type:Number,
    required:true
  },
  month:{
    type:Number
  },

  createdAt:{
    type:Date,
    default:Date.now
  }
});

const goalsModel= mongoose.model("Goal",GoalsSchema)
module.exports= goalsModel