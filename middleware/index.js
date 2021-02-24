const config = require('config');
const secret = config.get('app.secret');
const mongoose = require('mongoose');
const jwt = require('express-jwt');

// models
const User = require('@/models/User');

function getToken(req) {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Token") ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
}

const required = jwt({
  secret: secret,
  requestProperty: "auth", // sets decoded json token onto "auth" property on request object e.g req.auth.sub
  getToken: getToken,
  algorithms: ['HS256'],
});

const optional = jwt({
  secret: secret,
  requestProperty: "auth", // sets decoded json token onto "auth" property on request object e.g req.auth.sub
  algorithms: ['HS256'],
  credentialsRequired: false,
  getToken: getToken
});

const auth = {
  optionalRequireAuthUser: [optional, function(req, res, next) {
    const { auth } = req;
    if (!auth) {
      // doesn't invoke error callback if no authentication. skips to next middleware on stack
      return next();
    }
    if (auth.sub !== 'user') { // if auth but not valid user, return unauthorized error
      return next({
        name: "UnauthorizedError",
        message: "You must sign up or sign in."
      });
    }
    return User.findById(auth.id)
      .then(function(user) {
        if (!user) {
          return next({ name: "UnauthorizedError", message: "The password or email may be incorrect." });
        }
        req.authUser = user;
        req.user = user;
        return next();
      })
      .catch(next);
  }],
  requireAuthUser: [required, function(req, res, next) {
    const { auth } = req;
    if (auth.sub !== 'user') {
      return next({
        name: "UnauthorizedError",
        message: "You must sign up or sign in."
      });
    }
    return User.findById(auth.id)
      .then(function(user) {
        if (!user) {
          return next({ name: "UnauthorizedError", message: "The password or email may be incorrect." });
        }
        req.authUser = user;
        req.user = user;
        return next();
      })
      .catch(next);
  }],
};

module.exports = auth;
