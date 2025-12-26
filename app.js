/** @format */

//Requiring the modules
const pug = require("pug");
const path = require("path");
const express = require("express");
const fs = require("fs");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const cookieParser = require("cookie-parser");
const viewRouter = require("./routes/viewRoutes");
const bookingRouter = require("./routes/bookingRoutes.js");
const hpp = require("hpp");

// Setting up the Application
const app = express();

//Global MIDDLEWARE
//Setting up Template Engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
//Security HTTP Headers
app.use(helmet());

// Update your CSP configuration
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",
        "https://js.stripe.com", // Corrected Stripe
        "https://api.mapbox.com", // Added Mapbox
      ],
      connectSrc: [
        "'self'",
        "http://127.0.0.1:3000",
        "ws://localhost:*",
        "https://api.mapbox.com", // Added for Mapbox API calls
        "https://events.mapbox.com", // Added for Mapbox events
        "https://cdnjs.cloudflare.com", //
      ],
      imgSrc: ["'self'", "blob:", "data:", "https://api.mapbox.com"], // Added Mapbox for tiles
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameSrc: ["'self'", "https://js.stripe.com"], // Fixed Error B: Allows Stripe frames
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);
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
app.use(cookieParser());

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
const reviewRouter = require("./routes/reviewRouter.js");

//Mouted Router's

app.use(`/api/v1/tours`, tourRouter);
app.use(`/api/v1/users`, userRouter);
app.use(`/api/v1/review`, reviewRouter);
app.use(`/api/v1/booking`, bookingRouter);
app.use("/", viewRouter);

//Route Handeler for Uncaught Routes
app.all(`*`, (req, res, next) => {
  next(new AppErrors(`Can't find ${req.originalUrl} on this Server`, 404));
});

// Global Error Handler
app.use(GlobalErrorHandler);

module.exports = app;
