/** @format */

//Connecting the DB
const mongoose = require("mongoose");
const Tour = require(`./../../models/tourModel`);
const User = require(`./../../models/userModel`);
const Review = require(`./../../models/reviewsModel`);

const fs = require("fs");

//Dot Env File for Required using Environemnet Variables
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

//Setting Up DB Connection
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.PASSWORD);
mongoose.connect(DB).then(() => {
  console.log("DB Connection Successfully");
});

const Tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const Users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const Reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, "utf-8")
);

//Importing Data to Collection
const importData = async (req, res) => {
  try {
    await Tour.create(Tours);
    await User.create(Users, { validateBeforeSave: false });
    await Review.create(Reviews);
    console.log("Data Sent Successfully");
  } catch (err) {
    console.log(err);
  }
};

//Deleting Data From Collection
const deleteData = async (req, res) => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data Delete Successfully");
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === "---import") {
  importData();
} else if (process.argv[2] === "---delete") {
  deleteData();
}
