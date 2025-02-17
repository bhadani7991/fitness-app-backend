const mongoose = require("mongoose");
const validator = require("validator");

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

const User = mongoose.model("User", userSchema);
module.exports = User;
