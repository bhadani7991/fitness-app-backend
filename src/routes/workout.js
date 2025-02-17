const express = require("express");
const router = express.Router();
const loadash = require("lodash");
const logger = require("../config/logger");
const Workout = require("../model/Workout");
const { chunkSize } = require("../constants/appConstant");
const { userAuth } = require("../middleware/auth");
const mongoose = require("mongoose");

/**
 * Api to save the workouts detail entered by the user.
 * @param - [workout]
 */
router.post("/workouts", userAuth, async (req, res) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const userId = req.user._id;
    const workouts = req.body;

    //chunk workouts into batches of chunkSize
    const workoutBatches = loadash.chunk(workouts, chunkSize);

    for (const batch of workoutBatches) {
      const workoutsToSave = batch.map((workout) => ({ ...workout, userId }));
      await Workout.insertMany(workoutsToSave);
    }
    await session.commitTransaction();
    session.endSession();
    logger.info(`Workout details saved successfully`);
    res.status(201).json({ message: "Workout detail saved for the user" });
  } catch (error) {
    await session.abortTransaction();
    logger.error(
      `error occurred while saving workout details ${error.message}`
    );
    res.status(400).json({
      message: `Error occurred while saving Workout details ${error.message}`,
    });
  }
});

/**
 * Api to fetch the user workout details.
 */
router.get("/workouts", userAuth, async (req, res) => {
  try {
    //get the _id of logged in user
    const { _id } = req.user;
    const data = await Workout.find({
      userId: _id,
    })
      .populate("userId", ["name", "email"])
      .sort({
        updatedAt: -1,
      });
    logger.info("Workout details fetched successfully");
    res.json({
      message: `Workout details fetched successfully`,
      entity: data,
    });
  } catch (error) {
    logger.error(
      `Error occurred while fetching workout details : ${error.message}`
    );
    res.status(400).json({
      message: `Error occurred while fetching workout details ${error.message}`,
    });
  }
});

module.exports = router;
