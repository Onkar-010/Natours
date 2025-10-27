/** @format */

const mongoose = require("mongoose");
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A tour must have a name"],
    unique: true,
  },

  difficulty: {
    type: String,
    required: [true, "A tour must have a difficulty level"],
  },

  ratingAverage: {
    type: Number,
    default: 0,
  },

  ratingQuantity: {
    type: Number,
    default: 0,
  },

  price: {
    type: Number,
    required: [true, "A tour must have a Price"],
  },
  duration: {
    type: Number,
    required: [true, "A tour must have a duration"],
  },
  maxGroupSize: {
    type: Number,
    required: [true, "A tour must have a Max Group Size"],
  },
  summary: {
    type: String,
    required: [true, "A tour must have a Summary"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, "A tour must have a ImageCover"],
  },

  images: {
    type: [String],
    required: [true, "A tour must have a Image"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },

  startDates: {
    type: [Date],
  },
});

const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
