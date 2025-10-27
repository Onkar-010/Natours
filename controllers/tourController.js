/** @format */
const fs = require(`fs`);
const Tour = require("./../models/tourModel");

//Route Handlers
exports.getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.createATour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getATour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.updateATour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.deleteATour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};
