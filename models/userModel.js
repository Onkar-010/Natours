/** @format */
const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Fill out Your Name"],
  },

  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },

  email: {
    type: String,
    required: [true, "Email is Required"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "A Valid Email"],
  },

  photo: {
    data: Buffer,
    ContentType: String,
  },

  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },

  resetPasswordToken: {
    type: String,
  },

  resetPasswordTokenExpiresIn: {
    type: Date,
  },

  passwordChangedAt: {
    type: Date,
  },

  passwordConfirm: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      // only work when Create and save not on Update
      validator: function (el) {
        return el === this.password;
      },
      message: "Password Didn't Match! Try Again",
    },
  },

  active: {
    type: Boolean,
    default: true,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.comparePassword = async (
  candidatePassword,
  userPassword
) => {
  const isCorrect = await bcrypt.compare(candidatePassword, userPassword);
  return isCorrect;
};

userSchema.methods.CheckPasswordChangeAfter = function (JwtTimeStamp) {
  if (this.passwordChangedAt) {
    const changePassword = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(JwtTimeStamp, changePassword);
    if (changePassword) {
      return JwtTimeStamp < changePassword;
    }
  }

  //Flase means Didn't Changed the Password
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  //Construct the ResetToken
  const resetToken = crypto.randomBytes(32).toString("hex");

  //Encrypt the Reset Token and Save Encrypted token to DB
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordTokenExpiresIn = Date.now() + 10 * 60 * 1000;
  console.log(resetToken, this.resetPasswordToken);

  //REturn the ResetToken to AuthController
  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;

// import the mongoose module --> then define the Schema of it (mongoose.Schema({})) --> model implementing it const User = mongoose.model(User, "userSchema");
