const express = require("express");
const router = express.Router();
const loadash = require("lodash");
const logger = require("../config/logger");
const Workout = require("../model/Workout");
const { chunkSize, noOfWeek } = require("../constants/appConstant");
const { userAuth } = require("../middleware/auth");
const mongoose = require("mongoose");
const { validateEditWorkoutData } = require("../utils/validation");
const { startOfWeek, endOfWeek } = require("date-fns");
const sendEmail = require("../config/emailConfig");

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

    await sendEmail.run();
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
router.put("/workout/:id", userAuth, async (req, res) => {
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
    const updatedWorkout = req.body;
    // Save the updated workout
    await Workout.findByIdAndUpdate(workout._id, updatedWorkout, {
      new: true,
      timestamps: !updatedWorkout.updatedAt,
    });

    // Respond with a success message
    res.status(200).json({ message: "Workout updated successfully", workout });
  } catch (error) {
    logger.error(`Error while updating the workout details ${error.message}`);
    throw new Error(
      `Error while updating the workout details ${error.message}`
    );
  }
});

/**
 * Api to fetch workout trends
 */
router.get("/workout/trends", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    //get the previous noOfWeekData data
    let trends = [];
    for (let i = 0; i < noOfWeek; i++) {
      let start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start
      let end = endOfWeek(new Date(), { weekStartsOn: 1 });

      start.setDate(start.getDate() - i * 7); // Move back each week
      end.setDate(end.getDate() - i * 7);

      // Aggregate workout data for the week
      const weeklyData = await Workout.aggregate([
        {
          $match: {
            userId: userId,
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            totalCaloriesBurned: { $sum: "$caloriesBurned" },
            averageDuration: { $avg: "$duration" },
          },
        },
      ]);

      trends.push({
        week: `${start.toISOString().split("T")[0]} - ${
          end.toISOString().split("T")[0]
        }`,
        totalCaloriesBurned: weeklyData[0]?.totalCaloriesBurned || 0,
        averageDuration: weeklyData[0]?.averageDuration || 0,
      });
    }
    trends.sort((a, b) => {
      const dateA = new Date(a.week.split(" - ")[0]); // Extract start date of week
      const dateB = new Date(b.week.split(" - ")[0]); // Extract start date of week
      return dateA - dateB; // Compare the dates to sort
    });

    res.json({ trends });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching workout trends", error: error.message });
  }
});

module.exports = router;
