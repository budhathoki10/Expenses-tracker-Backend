const passport = require("passport");
const userModel = require("../Models/user.model");
const googleStrategy = require("passport-google-oauth20").Strategy;

const configureGoogleAuth = (req, res) => {
  passport.use(
    new googleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log("profile is", profile);

        try {
          const email = profile.emails[0].value;
          let checkuser = await userModel.findOne({ email: email });
          if (checkuser) {
            return done(null, checkuser);
          }
          checkuser = new userModel({
            userName: profile.displayName,
            email: email,
            image: profile.photos[0].value,
            OTPexpiryDate: null,
          });
          await checkuser.save();
          done(null, checkuser);
        } catch (error) {
          return done(error, null);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userModel.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

module.exports = configureGoogleAuth;
