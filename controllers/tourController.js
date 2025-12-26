/** @format */
const fs = require(`fs`);
const Tour = require("./../models/tourModel");
const catchAsync = require(`./../utils/catchAsync.js`);
const AppErrors = require(`./../utils/appErrors.js`);
const factory = require("./../controllers/handlerFactory.js");
const multer = require("multer");
const sharp = require("sharp");

//Route Handlers

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

exports.getTourWithIn = catchAsync(async (req, res, next) => {
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

//-------------Uploading multiple Tour images
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      new AppErrors("Please Provide an Photo in Image format only!", 400),
      false
    );
  }
};
const upload = multer({
  storage: multerStorage,
  filter: multerFilter,
});
exports.UploadMultipleTourImage = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.image) return next();

  //ImageCover
  req.body.imageCoverfilenmae = `tour-${
    req.params.id
  }-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`/public/img/tours/${req.body.imageCoverfilename}`);

  //Tour Images
  req.body.image = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.user.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`/public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );
  next();
});
//---------------

exports.updateATour = factory.updateOne(Tour);
exports.deleteATour = factory.deleteOne(Tour);
