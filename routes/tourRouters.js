const express = require('express');
const tourController = require('./../controllers/tourController');


//Creating a Mini Application
const router = express.Router();

//Defining Routes and middleware to run based on route
// router.param('id',tourController.checkID);

router
    .route(`/`)
    .get(tourController.getAllTours)
    .post(tourController.createATour);

router
    .route('/:id')
    .get(tourController.getATour)
    .patch(tourController.updateATour)
    .delete(tourController.deleteATour);

module.exports = router;