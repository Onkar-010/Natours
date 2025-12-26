/** @format */

const express = require("express");
const reviewController = require("./../controllers/reviewController");
const authController = require("./../controllers/authController");

//Creating a Mini Application
const router = express.Router({ mergeParams: true });
console.log("inside Booking route");

router.use(authController.protected);
router
  .route("/")
  .post(
    authController.restrictedTo("user"),
    reviewController.setTourAndUserId,
    reviewController.createAReview
  )
  .get(reviewController.getAllReviews);

router
  .route("/:id")
  .get(reviewController.getReview)
  .delete(authController.restrictedTo("user"), reviewController.deleteReview)
  .patch(authController.restrictedTo("user"), reviewController.updateReview);

module.exports = router;
