const express = require("express");
const { userAuth } = require("../middleware/auth");
const logger = require("../config/logger");
const User = require("../model/User");
const {
  isProfileUpdateAllowed,
  validateProfileUpdateData,
} = require("../utils/validation");

const router = express.Router();

/**
 * Api to fetch the user details.
 */
router.get("/profile/view", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.find({ _id: userId });
    if (!user) {
      logger.error(`User not found`);
      throw new Error(`User not found`);
    }
    logger.info(`${user} found successfully`);
    res.json({
      message: `profile fetched successfully`,
      entity: user,
    });
  } catch (error) {
    logger.error(`${error.message} occurred while viewing profile`);
    res.status(400).json({
      message: `Error occurred while viewing profile ${error}`,
    });
  }
});

/**
 * Api to update the user details
 */
router.put("/profile", userAuth, async (req, res) => {
  try {
    //Data sanitization
    const isUpdateAllowed = isProfileUpdateAllowed(req);
    if (!isUpdateAllowed) {
      logger.error(`Invalid Request`);
      throw new Error(`Invalid Update Request`);
    }

    const user = await User.findById({
      _id: req.user._id,
    });
    if (!user) {
      logger.error("User not found");
      throw new Error("User not found");
    }
    const userData = req.body;
    // Update the workout with the passed data
    Object.keys(userData).forEach((key) => {
      user[key] = userData[key];
    });

    // Save the updated workout
    const updatedUser = await user.save();
    logger.info("User details updated successfully");
    res.json({
      message: "User details updated Successfully",
      entity: updatedUser,
    });
  } catch (error) {
    logger.error(
      `Error occurred while updating profile details ${error.message}`
    );
    res.status(400).json({
      message: `Error occurred while updating profile details ${error}`,
    });
  }
});

module.exports = router;
