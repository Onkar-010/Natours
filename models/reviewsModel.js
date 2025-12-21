/** @format */

const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Please write an review Here"],
    },
    rating: {
      type: Number,
      required: [true, "You Must also Submit your Rating for this Tour"],
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },

    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "You must belong to a Tour"],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "You must belong to a User"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

reviewSchema.statics.calAverageRating = async function (id) {
  const stats = await this.aggregate([
    { $match: { tour: id } },
    {
      $group: {
        _id: "$tour",
        NRating: { $sum: 1 },
        ratingAvg: { $avg: "$rating" },
      },
    },
  ]);
  console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(id, {
      ratingQuantity: stats[0].NRating,
      ratingAverage: stats[0].ratingAvg,
    });
  } else {
    await Tour.findByIdAndUpdate(id, {
      ratingQuantity: 0,
      ratingAverage: 4.5,
    });
  }
};
reviewSchema.index({ user: 1, tour: 1 }, { unique: true });
reviewSchema.post("save", function () {
  console.log(this);
  this.constructor.calAverageRating(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // Now we use the document we saved in 'this.r' to run the calculation
  await this.r.constructor.calAverageRating(this.r.tour);
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
