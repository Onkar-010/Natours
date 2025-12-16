/** @format */

const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

//Creating a Mini Application
const router = express.Router();

router.route("/signup").post(authController.signUp);
router.route("/login").post(authController.login);
router.route("/forgetPassword").post(authController.forgetPassword);
router.route("/resetPassword/:resetToken").post(authController.resetPassword);
router
  .route("/updatePassword")
  .patch(authController.protected, authController.updatePassword);

router
  .route("/updateMe")
  .patch(authController.protected, userController.updateMe);

router
  .route("/deleteMe")
  .patch(authController.protected, userController.deleteMe);

//Defining Routes and middleware to run based on route
router
  .route(`/`)
  .get(userController.getAllUsers)
  .post(userController.createAUser);

router
  .route("/:id")
  .get(userController.getAUser)
  .patch(userController.updateAUser)
  .delete(userController.deleteAUser);

module.exports = router;
