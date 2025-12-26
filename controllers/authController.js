/** @format */

const User = require("./../models/userModel");
const catchAsync = require(`./../utils/catchAsync.js`);
const AppErrors = require(`./../utils/appErrors.js`);
const Email = require(`../utils/sendEmail.js`);
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SCERET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendJwtToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    data: {
      token,
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const url = `${req.protocol}://${req.get("host")}/me`;
  console.log(url);

  //send welcome Email
  await new Email(newUser, url).sendWelcome();

  //Sending the Web token to the client on signUP
  createAndSendJwtToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  console.log();
  //if Email and password Exits
  if (!email || !password)
    return next(new AppErrors("Please Enter the Email and Password"), 400);

  //if Email and Password Exits in DB
  const user = await User.findOne({ email: email }).select(`+password`);
  // Check if user exists AND password is correct in one block
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppErrors("Incorrect Email or Password", 401));
  }

  //if true Generate token
  createAndSendJwtToken(user, 201, res);
});

exports.logout = (req, res) => {
  console.log("1", req.cookies);
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  console.log("2", req.cookies);
  res.status(200).json({ status: "success" });
};

exports.protected = catchAsync(async (req, res, next) => {
  //Check if token exits
  let token;
  console.log("ola", req.cookies);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppErrors("You are not Logged in, Please Login to get Access!", 401)
    );
  }

  //Verifying the Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SCERET);

  //Check if User Exists
  const currUser = await User.findById(decoded.id);
  if (!currUser) {
    return next(
      new AppErrors("The User Belongging to this Token No Longer Exist!", 401)
    );
  }

  //Check if Your Has Changed there Password after the Token Was issued
  // @ts-ignore
  if (currUser.CheckPasswordChangeAfter(decoded.iat)) {
    return next(
      new AppErrors("User has Changed the Password! Please Login Again", 401)
    );
  }

  //
  req.user = currUser;
  res.locals.user = currUser;
  next();
});

//Only for rendered pages

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  //Check if token exits
  if (req.cookies.jwt) {
    try {
      let token = req.cookies.jwt;

      //Verifying the Token
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SCERET
      );

      //Check if User Exists
      const currUser = await User.findById(decoded.id);
      if (!currUser) {
        return next();
      }

      //Check if Your Has Changed there Password after the Token Was issued
      // @ts-ignore
      if (currUser.CheckPasswordChangeAfter(decoded.iat)) {
        return next();
      }

      //
      res.locals.user = currUser;
      console.log(res.locals.user);

      return next();
    } catch (err) {
      // If JWT is 'loggedout' or invalid, just move to next middleware
      return next();
    }
  }
  next();
});

exports.restrictedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppErrors("You are not Authorized to Perform this action!", 403)
      );
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  //Check Email Exist or not
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppErrors("There is No USer with this Email !", 404));
  }

  //Generate Random Reset Token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //Send the RestURL On email
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forget Your Password ? Submit a PATCH Request with Your new Password and Passowrd Confirm to: ${resetUrl},if Yoiu did'n't Forget yout Password Igonre this Email`;
  try {
    await new Email(user, resetUrl).sendpasswordReset();

    res.status(200).json({
      status: "success",
      data: {
        resetToken,
        message: "Mail Sent Sucessfully",
      },
    });
  } catch (error) {
    //Rest userPasswordResetToken and Expired
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });
    next(
      new AppErrors(
        "There was an Error While Sending the Error? Please Try Again Later",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //Get the reset Token From the req.body
  const hashedPassword = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  //Check whether user Exits for that Token in DB and Also Check whether resetToken Expired and Set the Password
  const user = await User.findOne({
    resetPasswordToken: hashedPassword,
    resetPasswordTokenExpiresIn: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppErrors("Token is invalid or has expired", 400));
  }

  //3: Set the Password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.resetPasswordToken = undefined; // Clear the token used
  user.resetPasswordTokenExpiresIn = undefined; // Clear expiry

  await user.save();

  //Update ChangePasswordAT  Property of Current USer
  // user.passwordChangedAt = Date.now();

  //Login USer in and Send the JWT
  createAndSendJwtToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currPassword, newPassword, confirmPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    return next(new AppErrors("Please Login!", 401));
  }

  if (!(await user.comparePassword(currPassword, user.password))) {
    return next(
      new AppErrors(
        "Wrong Current Password! Please Enter Correct Password",
        403
      )
    );
  }

  //Check newPass === confirmPass
  user.password = newPassword;
  user.passwordConfirm = confirmPassword;

  //Save to DB
  await user.save();

  //send an Response
  createAndSendJwtToken(user, 201, res);
});
