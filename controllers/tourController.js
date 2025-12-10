/** @format */
const fs = require(`fs`);
const Tour = require("./../models/tourModel");
const catchAsync = require(`./../utils/catchAsync.js`);
const AppErrors = require(`./../utils/appErrors.js`);

//Route Handlers
exports.getAllTours = catchAsync(async (req, res, next) => {
  //1) Filtering
  const queryObj = { ...req.query };
  const excludedFields = ["sort", "page", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  //2) Advance Filtering
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let query = Tour.find(JSON.parse(queryStr));

  //Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query = query.sort(sortBy);
  } else {
    query = query = query.sort("-createdAt");
  }

  //Field Limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    query = query = query.select(fields);
  } else {
    query = query = query.select("-__v");
  }

  //Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  if (req.query.page) {
    const newTours = Tour.countDocuments();
    if (skip >= newTours) throw new Error("This page does not Exits");
  }

  //Executing Query
  const tours = await query;
  res.status(200).json({
    status: "success",
    totalTours: tours.length,
    data: {
      tours: tours,
    },
  });
});

exports.createATour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
});

exports.getATour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppErrors("Didn't find a Tour , Invalid ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      tour: tour,
    },
  });
});

exports.updateATour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppErrors("Didn't find a Tour , Invalid ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      tour: tour,
    },
  });
});

exports.deleteATour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppErrors("Didn't find a Tour , Invalid ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: {
      tour,
    },
  });
});
