/** @format */

//Connecting the DB through mongooes to Express APP
const mongoose = require("mongoose");
const Tour = require("./models/tourModel");

process.on("uncaughtException", (err) => {
  console.log("Unhandeled Exception 💥  Shutting Dow");
  console.log(err);

  process.exit(1);
});

//Dot Env File for Required using Environemnet Variables
const dotenv = require("dotenv"); //adds config.env file varble in the process.env var
dotenv.config({ path: "./config.env" });

const app = require("./app");

//Setting Up DB Connection
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.PASSWORD);
mongoose.connect(DB).then(() => {
  console.log("DB Connection Successfully");
});

//Defining port
const port = process.env.PORT || 3000;

//Starting the Server [server starts listening for req]
const server = app.listen(port, () => {
  console.log("App started to for listening request's on port: " + `${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandeled rejection 💥  Shutting Dow");
  server.close(() => {
    process.exit(1);
  });
});
