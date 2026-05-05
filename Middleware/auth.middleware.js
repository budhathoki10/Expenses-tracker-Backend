// imoorting all the library
const jwt = require("jsonwebtoken");
const userModel = require("../Models/user.model");

//  check or authenticate if the user have login or not
const Authentication = async (req, res, next) => {
  try {
    // check cookie if present or not. if not then user have not login yet
    const token =
      (req.headers.authorization && req.headers.authorization.split(" ")[1]) ||
      req.cookies["Cookie-token"];
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "unauthorized, token not found",
      });
    }
// verify if the user is original user or not
    const verifytoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECERET_KEY);
    // console.log(verifytoken)
    if (!verifytoken) {
      return res.status(400).json({
        success: false,
        message: "unauthorized, token not verified",
      });
    }
// check if the login user is same as the previously login user or not
    const userdata = await userModel.findById(verifytoken.id);
    if (!userdata) {
      return res.status(400).json({
        success: false,
        message: "unauthorized, user is not found with this id",
      });
    }
    // pass the data to req.user
    req.user = userdata;
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "internal server error in authentication",
    });
  }
};
module.exports = Authentication;
