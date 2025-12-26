/** @format */

const express = require("express");
const viewsController = require("../controllers/viewsController");
const bookingController = require("../controllers/bookingController");
const authController = require("../controllers/authController");
// const bookingController = require("../controllers/bookingController");

const router = express.Router();

router.get(
  "/",
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);

router.get("/tour/:slug", authController.isLoggedIn, viewsController.getTour);
router.get("/login", authController.isLoggedIn, viewsController.getLoginForm);
router.get("/me", authController.protected, viewsController.getAccount);

router.get(
  "/my-tours",
  authController.protected,
  viewsController.getMyBookings
);

router.post(
  "/submit-user-data",
  authController.protected,
  viewsController.updateUserData
);

module.exports = router;
