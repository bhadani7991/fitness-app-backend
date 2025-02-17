const express = require("express");
const { userAuth } = require("../middleware/auth");
const logger = require("../config/logger");
const Goals = require("../model/Goal");
const {
  isGoalDetailsAllowed,
  isGoalDetailsValid,
} = require("../utils/validation");
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

module.exports = router;
