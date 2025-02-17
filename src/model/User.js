const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

/**
 * User Collection to store the individual user related detail.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error(`Email is not valid : ${value}`);
        }
      },
    },
    age: {
      type: Number,
      max: 70,
    },
    weight: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error(`Password is not strong`);
        }
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJWT = async function (params) {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, process.env.SECRET_KEY, {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordEnteredByUser) {
  const user = this;
  const isPasswordValid = await bcrypt.compare(
    passwordEnteredByUser,
    user.password
  );
  return isPasswordValid;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
