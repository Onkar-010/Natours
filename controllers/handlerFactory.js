/** @format */

const catchAsync = require(`./../utils/catchAsync.js`);
const AppErrors = require(`./../utils/appErrors.js`);
const APIFeatures = require("./../utils/APIFeatures.js");

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.id) filter = { tour: req.params.id };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        doc,
      },
    });
  });

exports.getOne = (Model, paramOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (paramOptions) query.populate(paramOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppErrors("Didn't find a Doc , Invalid ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: newDoc,
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppErrors("Didn't find a Document , Invalid ID", 404));
    }
    res.status(204).json({
      status: "success",
      data: {
        doc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppErrors("Didn't find a Doc , Invalid ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });
