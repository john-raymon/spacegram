require("dotenv").config();
require('module-alias/register');
const config = require('config');
const mongodbUri = config.get('app.mongodbUri');
const isProduction = process.env.NODE_ENV !== 'development';
const mongoose = require('mongoose');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
// const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const secretKey = config.get('app.secret');
const logger = require('morgan');
const helmet = require('helmet');
const history = require('connect-history-api-fallback');
const passport = require("passport");
const bodyParser = require("body-parser");
const app = express();

// Set up Mongodb
if (isProduction) {
  mongoose.connect(mongodbUri);
  app.set('trust proxy', 1) // trust first proxy
} else {
  mongoose
    .connect(mongodbUri, { useUnifiedTopology: true, useNewUrlParser: true })
    .catch((error) => {
      console.log("Mongodb crashed ERROR:", error);
    });
  mongoose.set("debug", true);
}

app.use(session({
  secret: secretKey,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection, collection: 'sessions' }),
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: true,
    maxAge: 1296000, // 15 days
  },
  resave: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// log session stuff in dev.
if (!isProduction) {
  app.use((req, res, next) => {
    console.log('req.session -->', req.session);
    console.log('req.user -->', req.user);
    console.log('req.passport session -->', req.session.passport)
    next();
  })
}

const sixtyDaysInSeconds = 5184000
app.use(helmet.hsts({
  maxAge: sixtyDaysInSeconds
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());

app.use(history());
app.use(express.static('./client/dist'));

// API endpoints
app.use('/api', require('./routes/api'));

app.get("/*", function(req, res) {
  return res.sendFile("./client/public/index.html", { root: __dirname });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  return next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  if (!isProduction) { // log error in development
    console.log({ err, req, res });
  }
  // render the error page
  return res.status(err.status || 500).json({ message: err.message });
});

module.exports = app;
