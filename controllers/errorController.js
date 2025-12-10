/** @format */
const AppErrors = require("./../utils/appErrors.js");

const handelCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}.`;
  return new AppErrors(message, 400);
};

const handleDuplicateFieldsErrorDB = (err) => {
  // Newer MongoDB drivers give you the object directly!
  // e.g. err.keyValue = { name: "The Forest Hiker" }
  const value = Object.values(err.keyValue)[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppErrors(message, 400);
};

const handleValidatorError = (err) => {
  const InvalidInputs = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Inputs Data : ${InvalidInputs.join(". ")}`;
  return new AppErrors(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    errstack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //Log error fro Programmer
    console.log(`ERROR 💥`, err);
    // for Programming error send generic error to clinet
    res.status(500).json({
      status: "error",
      message: "Somehting went Wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || `internal Server Error`;

  if (process.env.NODE_ENV === `development`) {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === `production`) {
    let error = { ...err };
    error.name = err.name;

    if (error.name === "CastError") {
      error = handelCastErrorDB(error);
    }
    if (error.code === "11000") {
      error = handleDuplicateFieldsErrorDB(error);
    }
    if (err.name === "ValidationError") {
      error = handleValidatorError(error);
    }

    sendErrorProd(error, res);
  }
};
