/** @format */

//Requiring the modules
const express = require("express");
const fs = require("fs");
const morgan = require("morgan");

// Setting up the Application
const app = express();

// MIDDLEWARE
app.use(express.json()); // lets to acces the req.body

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Improting route specific Routes
const tourRouter = require("./routes/tourRouters.js");
const userRouter = require("./routes/userRouters.js");

//Mouted Router's
app.use(`/api/v1/tours`, tourRouter);
app.use(`/api/v1/users`, userRouter);

module.exports = app;
