/** @format */
const User = require("./../models/userModel");
const catchAsync = require(`./../utils/catchAsync.js`);
const AppErrors = require(`./../utils/appErrors.js`);
const factory = require("./../controllers/handlerFactory.js");

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
exports.getMe = (req, res, next) => {
  //get the id and stroe in params
  if (!req.params.id) req.params.id = req.user._id;
  next();
};

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

// exports.createAUser = factory.createOne(User); Use Sign UP Instead
exports.getAllUsers = factory.getAll(User);
exports.getAUser = factory.getOne(User);
exports.updateAUser = factory.updateOne(User);
exports.deleteAUser = factory.deleteOne(User);
