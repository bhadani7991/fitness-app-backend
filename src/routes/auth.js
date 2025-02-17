const express = require("express");
const logger = require("../config/logger");
const { isSaveAllowed, validateSignupData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const { saltRound } = require("../constants/constant");
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

    const savedUser = await user.save();
    logger.info(`User saved successfully`);
    const token = await savedUser.getJWT();
    logger.debug("token generated successfully");
    res.cookie("token", token, {
      expires: new Date(Date.now() + 6 * 60 * 60 * 1000), // expires after 6 hour
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

module.exports = router;
