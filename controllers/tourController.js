/** @format */
const fs = require(`fs`);
const Tour = require("./../models/tourModel");
const catchAsync = require(`./../utils/catchAsync.js`);
const AppErrors = require(`./../utils/appErrors.js`);
const factory = require("./../controllers/handlerFactory.js");

//Route Handlers

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

exports.getTourWithIn = catchAsync(async (req, res, next) => {
  console.log(req.params);
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppErrors("Please Enter the cordinates in this Format : lat,lng", 400)
    );
  }
  // ✅ CORRECT (Nested coordinates + converted to numbers)
  const tour = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng * 1, lat * 1], radius],
      },
    },
  });
  //get the tours based on the it
  res.status(200).json({
    status: "success",
    totalResults: tour.length,
    data: {
      data: tour,
    },
  });
});

exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppErrors("Please Enter the cordinates in this Format : lat,lng", 400)
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);

  //get the tours based on the it
  res.status(200).json({
    status: "success",
    // totalResults:
    data: {
      data: distances,
    },
  });
});

exports.getAllTours = factory.getAll(Tour);
exports.createATour = factory.createOne(Tour);
exports.getATour = factory.getOne(Tour, { path: "reviews" });
exports.updateATour = factory.updateOne(Tour);
exports.deleteATour = factory.deleteOne(Tour);
