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

const handleInvalidSignature = () => {
  return new AppErrors("Invalid Token! Please Login Again", 401);
};

const handleExpiredJwtToken = () => {
  return new AppErrors("Token Expired! Please Login Again", 401);
};

const sendErrorDev = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      errstack: err.stack,
    });
  }
  //REndered
  return res.status(err.statusCode).render("error", {
    title: "Something went Wrong!",
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  //API

  console.log("1");
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        errstack: err.stack,
      });
    }
    console.log("2");

    //Log error fro Programmer
    console.log(`ERROR 💥`, err);
    // for Programming error send generic error to clinet
    return res.status(500).json({
      status: "error",
      message: "Somehting went Wrong!",
    });
  }

  //Renderend Websit
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went Wrong!",
      msg: err.message,
    });
  } else {
    //Log error fro Programmer
    console.log(`ERROR 💥`, err);
    // for Programming error send generic error to clinet
    return res.status(err.statusCode).render("error", {
      title: "Something went Wrong!",
      msg: "Please Try again Later",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || `internal Server Error`;

  if (process.env.NODE_ENV === `development`) {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === `production`) {
    let error = { ...err };
    error.message = err.message;
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
    if (err.name === "JsonWebTokenError") {
      error = handleInvalidSignature();
    }
    if (err.name === "TokenExpiredError") {
      error = handleExpiredJwtToken();
    }
    sendErrorProd(error, req, res);
  }
};
