/** @format */
const User = require("./../models/userModel");
const catchAsync = require(`./../utils/catchAsync.js`);
const AppErrors = require(`./../utils/appErrors.js`);

const filterObj = (reqBodyObj, ...allowedFields) => {
  const newObj = {};
  Object.keys(reqBodyObj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = reqBodyObj[el];
    }
  });
  return newObj;
};

//User's Route Handler
exports.getAllUsers = catchAsync(async (req, res) => {
  //Executing Query
  const users = await User.find();
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users: users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  //create an Error if he tries to Update the Password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppErrors(
        "This Route is Not For password update ! Use diff Route ",
        400
      )
    );
  }
  //Update the User Data
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new AppErrors("Didn't Find the user", 400));
  }

  const filteredBody = filterObj(req.body, "name", "email", "photo");
  console.log(filteredBody);
  const updatedUserData = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: filteredBody },
    {
      new: true, // Returns the updated document
      runValidators: true, // Runs validation only for the fields in $set
    }
  );
  res.status(201).json({
    status: "sucess",
    updatedUserData,
    message: "Updated your Data Sucessfully",
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  //delete user
  await User.findByIdAndUpdate(req.user._id, { active: false });

  //give response
  res.status(204).json({
    status: "sucess",
    message: "User Delected Successfully!",
  });
});

exports.createAUser = (req, res) => {
  // setting up newtour
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  res.status(500).json({
    status: "success",
    message: "Internal Server Failer",
  });
};

exports.getAUser = (req, res) => {
  // Formatting params
  const id = req.params.id * 1;

  //Wrong id
  if (id > tours.length) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
  }
  res.status(500).json({
    status: "success",
    message: "Internal Server Failer",
  });
};

exports.updateAUser = (req, res) => {
  // Formatting params
  const id = req.params.id * 1;

  //Wrong id
  if (id > tours.length) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
  }
  res.status(500).json({
    status: "success",
    message: "Internal Server Failer",
  });
};

exports.deleteAUser = (req, res) => {
  // Formatting params
  const id = req.params.id * 1;

  //Wrong id
  if (id > tours.length) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
};
