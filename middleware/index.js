const config = require('config');
const secret = config.get('app.secret');
const mongoose = require('mongoose');
// models
const User = require('@/models/User');

// function getToken(req) {
//   if (
//     (req.headers.authorization &&
//       req.headers.authorization.split(" ")[0] === "Token") ||
//     (req.headers.authorization &&
//       req.headers.authorization.split(" ")[0] === "Bearer")
//   ) {
//     return req.headers.authorization.split(" ")[1];
//   }
//   return null;
// }

const auth = {
  sessionRequireUser: [(req, res, next) => {
    if (req.isAuthenticated()) {
     return next();
    }
    return next({
      name: "UnauthorizedError",
      message: "You must sign up or sign in."
    });
  }],
};

module.exports = auth;
