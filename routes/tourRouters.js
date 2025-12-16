/** @format */

const express = require("express");
const tourController = require("./../controllers/tourController");
const authController = require("./../controllers/authController");

//Creating a Mini Application
const router = express.Router();

//Defining Routes and middleware to run based on route
// router.param('id',tourController.checkID);

router
  .route(`/`)
  .get(authController.protected, tourController.getAllTours)
  .post(tourController.createATour);

router
  .route("/:id")
  .get(tourController.getATour)
  .patch(tourController.updateATour)
  .delete(
    authController.protected,
    authController.restrictedTo("admin", "lead-guide"),
    tourController.deleteATour
  );

module.exports = router;
