const express = require("express");
const router = express.Router();
const loadash = require("lodash");
const logger = require("../config/logger");
const Workout = require("../model/Workout");
const { chunkSize } = require("../constants/appConstant");
const { userAuth } = require("../middleware/auth");
const mongoose = require("mongoose");
const { validateEditWorkoutData } = require("../utils/validation");

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

/**
 * Api for deleting the workout detail.
 */
router.delete("/workout/:id", userAuth, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        message: `Please Enter valid ${id}`,
      });
    }
    const workout = await Workout.findByIdAndDelete({ _id: id });
    logger.error(`${workout} deleted successfully`);
    res.json({
      message: `workout deleted successfully`,
    });
  } catch (error) {
    logger.error(`Error while deleting the workout detail ${error.message}`);
    res.status(400).json({
      message: `Error while deleting the workout detail ${error.message}`,
    });
  }
});

/**
 * Api to update the Workout details.
 */
router.patch("/workout/:id", userAuth, async (req, res) => {
  try {
    //data santization
    const isUpdateAllowed = validateEditWorkoutData(req);
    if (!isUpdateAllowed) {
      throw new Error("Invalid Edit Request");
    }
    const loggedInUser = req.user;

    const workoutData = req.body;

    // Ensure that the workout exists before updating
    const workout = await Workout.findById({
      _id: req.params.id,
    });
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    // Ensure that the logged-in user matches the workout userId
    if (workout.userId.toString() !== loggedInUser._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this workout" });
    }

    // Update the workout with the passed data
    Object.keys(workoutData).forEach((key) => {
      workout[key] = workoutData[key];
    });

    // Save the updated workout
    await workout.save();

    // Respond with a success message
    res.status(200).json({ message: "Workout updated successfully", workout });
  } catch (error) {
    logger.error(`Error while updating the workout details ${error.message}`);
    throw new Error(
      `Error while updating the workout details ${error.message}`
    );
  }
});

module.exports = router;
