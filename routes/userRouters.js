const express = require('express');
const userController = require('./../controllers/userController');


//Creating a Mini Application
const router = express.Router();

//Defining Routes and middleware to run based on route
router
    .route(`/`)
    .get(userController.getAllUsers)
    .post(userController.createAUser);

router
    .route('/:id')
    .get(userController.getAUser)
    .patch(userController.updateAUser)
    .delete(userController.deleteAUser);

module.exports = router;