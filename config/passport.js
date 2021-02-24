const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const User = require("@/models/User");

const userPassport = new passport.Passport();

// passport.serializeUser(function(user, done) {
//   done(null, user.id);
// });

// passport.deserializeUser(function(id, done) {
//   User.findById(id, function (err, user) {
//       if (err) { return done(err); }
//       done(null, user);
//   });
// });

userPassport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    function(email, password, done) {
      User.findOne({ email })
        .then(function(user) {
          if (!user || !user.validPassword(password)) {
            return done(null, false, {
              name: 'UnauthorizedError',
              message: 'The email or password is incorrect.'
            });
          }
          return done(null, user);
        })
        .catch(done);
    }
  )
);

module.exports = {
  userPassport,
};
