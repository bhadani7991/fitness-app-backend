const express = require("express");
const logger = require("../config/logger");
const { isSaveAllowed, validateSignupData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const {
  saltRound,
  cookieTimeoutDuration,
} = require("../constants/appConstant");
const User = require("../model/User");

const router = express.Router();

/**
 * Api to register the user.
 */
router.post("/signup", async (req, res) => {
  try {
    // validate whether all the fields of signup request is present in the request body
    isSaveAllowed(req);

    // validate the signup request data
    validateSignupData(req);

    const { name, email, password, weight, age = null } = req.body;
    //Encrypt the password using Bcrypt Password Encoder
    const encryptedPassword = await bcrypt.hash(password, saltRound);

    const user = new User({
      name,
      email,
      password: encryptedPassword,
      age,
      weight,
    });

    //save user into database
    const savedUser = await user.save();
    logger.info(`User saved successfully`);

    //generating jwt token
    const token = await savedUser.getJWT();
    logger.debug("token generated successfully");

    //attaching the token to the cookie for authentication purpose
    res.cookie("token", token, {
      expires: new Date(Date.now() + cookieTimeoutDuration), // expires after 6 hour
    });
    logger.info("setted cookie successfully");

    res.json({
      message: `user registered successfully`,
      entity: savedUser,
    });
  } catch (error) {
    logger.error(`Error while registering the user : ${error.message}`);
    res.status(400).json({
      message: `Error while registering the user : ${error.message}`,
    });
  }
});

/**
 * login Api to allow user to login into the application.
 *
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email,
    });
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isPasswordMatch = await user.validatePassword(password);
    if (!isPasswordMatch) {
      throw new Error("Invalid Credentials");
    } else {
      // create a jwt token
      const token = await user.getJWT();
      logger.debug("token generated successfully");

      //attaching the token to the cookie for authentication purpose
      res.cookie("token", token, {
        expires: new Date(Date.now() + cookieTimeoutDuration), // validity of token
      });
      logger.info("setted cookie successfully");
      res.json({
        message: `${user.name} logged in successfully`,
        entity: user,
      });
    }
  } catch (error) {
    logger.error(`Error occurred while login ${error.message}`);
    res.status(400).json({
      message: `${error.message}`,
    });
  }
});

/**
 * Api to logout the logged in User
 */
router.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  logger.info("User logged out Successfully");
  res.send(`Logged out successfully`);
});

module.exports = router;
