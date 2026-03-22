const mongoose = require("mongoose");
const { date } = require("zod/mini");
const userSchema = mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
    },
    OTP: {
      type: String,
      default: null,
    },
    OTPexpiryDate: {
      type: Date,
      default: Date.now,
    },
    image: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);
const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
