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

router.use(authController.protected);

router.route("/updatePassword").patch(authController.updatePassword);

router.route("/me").get(userController.getMe, userController.getAUser);

router.route("/updateMe").patch(userController.updateMe);

router.route("/deleteMe").patch(userController.deleteMe);

//Defining Routes and middleware to run based on route
router.use(authController.restrictedTo("admin"));

router.route(`/`).get(userController.getAllUsers);

router
  .route("/:id")
  .get(userController.getAUser)
  .patch(userController.updateAUser)
  .delete(userController.deleteAUser);

module.exports = router;
