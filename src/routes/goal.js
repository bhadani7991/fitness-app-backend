const express = require("express");
const { userAuth } = require("../middleware/auth");
const logger = require("../config/logger");
const Goals = require("../model/Goal");
const Workout = require("../model/Workout");
const { startOfWeek } = require("date-fns");
const {
  isGoalDetailsAllowed,
  isGoalDetailsValid,
} = require("../utils/validation");
const User = require("../model/User");
const router = express.Router();
/**
 * Api to save the goal detail.
 */
router.post("/goal", userAuth, async (req, res) => {
  try {
    //data sanitization
    const isGoalAllowed = isGoalDetailsAllowed(req);
    if (!isGoalAllowed) {
      throw new Error(`Please enter valid Goal Details`);
    }
    //data validation
    isGoalDetailsValid(req);

    const { workoutsPerWeek, targetWeight, caloriesBurnedGoal } = req.body;
    const goal = new Goals({
      userId: req.user._id,
      workoutsPerWeek,
      targetWeight,
      caloriesBurnedGoal,
    });
    const data = await goal.save();
    res.json({
      message: `Goal detail saved successfully`,
      entity: data,
    });
  } catch (error) {
    logger.error(`Error while saving the goal details : ${error.message}`);
    res.status(400).json({
      message: `Error while saving goal details ${error.message}`,
    });
  }
});

router.get("/goal/progress", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch latest goal
    const goal = await Goals.findOne({ userId }).sort({ createdAt: -1 });

    if (!goal) {
      return res
        .status(404)
        .json({ message: "No fitness goals found, please set Goal" });
    }
    const today = new Date();
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });

    // Fetch workouts from this week
    const workouts = await Workout.find({
      userId,
      createdAt: { $gte: startOfThisWeek },
    });

    // Calculate progress
    const workoutsCompleted = workouts.length;
    const caloriesBurned = workouts.reduce(
      (sum, workout) => sum + workout.caloriesBurned,
      0
    );

    //fetch user details for current weight
    const userDetails = await User.findOne({
      _id: userId,
    });
    const latestWeight = userDetails.weight || 70;

    // Calculate percentages
    const workoutProgress = Math.min(
      (workoutsCompleted / goal.workoutsPerWeek) * 100,
      100
    );
    const caloriesProgress = Math.min(
      (caloriesBurned / goal.caloriesBurnedGoal) * 100,
      100
    );
    const weightProgress = Math.min(
      ((goal.targetWeight - latestWeight) / goal.targetWeight) * 100,
      100
    );

    // Return progress data
    res.status(200).json({
      progress: {
        workoutsCompleted,
        workoutGoal: goal.workoutsPerWeek,
        workoutProgress: workoutProgress.toFixed(2),

        caloriesBurned,
        calorieGoal: goal.caloriesBurnedGoal,
        caloriesProgress: caloriesProgress.toFixed(2),

        currentWeight: latestWeight,
        targetWeight: goal.targetWeight,
        weightProgress: weightProgress.toFixed(2),
      },
    });
  } catch (error) {
    logger.error(
      `Error occurred while fetching the goal progress details ${error.message}`
    );
    res.status(400).json({
      message: `Error occurred while fetching the goal progress details ${error.message}`,
    });
  }
});

module.exports = router;
