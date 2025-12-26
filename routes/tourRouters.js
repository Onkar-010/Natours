/** @format */

const express = require("express");
const tourController = require("./../controllers/tourController");
const authController = require("./../controllers/authController");
const reviewRouter = require("./../routes/reviewRouter");

//Creating a Mini Application
const router = express.Router();

//Defining Routes and middleware to run based on route
// router.param('id',tourController.checkID);
router.use("/:id/reviews", reviewRouter);

router
  .route(`/tours-within/distance/:distance/latlng/:latlng/unit/:unit`)
  .get(tourController.getTourWithIn);

router.route(`/distances/:latlng/unit/:unit`).get(tourController.getDistance);

router
  .route(`/`)
  .get(authController.protected, tourController.getAllTours)
  .post(
    authController.restrictedTo("admin", "lead-guide"),
    tourController.createATour
  );

router
  .route("/:id")
  .get(tourController.getATour)
  .patch(
    authController.protected,
    authController.restrictedTo("admin", "lead-guide"),
    tourController.UploadMultipleTourImage,
    tourController.resizeTourImages,
    tourController.updateATour
  )
  .delete(
    authController.protected,
    authController.restrictedTo("admin", "lead-guide"),
    tourController.deleteATour
  );

module.exports = router;
