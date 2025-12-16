/** @format */

//Requiring the modules
const express = require("express");
const fs = require("fs");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const hpp = require("hpp");

// Setting up the Application
const app = express();

//Global MIDDLEWARE
//Security HTTP Headers
app.use(helmet());

//Rate Limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP! Please Try again One Hour Later",
});

app.use("/api", limiter);

//Lets to acces the req.body
app.use(
  express.json({
    limit: "10kb",
  })
);

//Data Sanitization against NoSQL query injector and
app.use(mongoSanitize());
//Data Sanitization against XSS
app.use(xssClean());

//Preventing Parameter Pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingQuantity",
      "ratingAvrage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

//DEv or pord env
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Improting route specific Routes
const AppErrors = require("./utils/appErrors.js");
const GlobalErrorHandler = require("./controllers/errorController.js");
const tourRouter = require("./routes/tourRouters.js");
const userRouter = require("./routes/userRouters.js");

//Mouted Router's
app.use(`/api/v1/tours`, tourRouter);
app.use(`/api/v1/users`, userRouter);

//Route Handeler for Uncaught Routes
app.all(`*`, (req, res, next) => {
  next(new AppErrors(`Can't find ${req.originalUrl} on this Server`, 404));
});

// Global Error Handler
app.use(GlobalErrorHandler);

module.exports = app;
