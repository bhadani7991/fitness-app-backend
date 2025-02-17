const mongoose = require("mongoose");

/**
 * Goal Collection to Store the user goal.
 */
const goalsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workoutsPerWeek: {
      type: Number,
      required: true,
      min: 1,
    },

    targetWeight: {
      type: Number,
      required: true,
      min: 1,
    },

    caloriesBurnedGoal: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["in progress", "completed"],
      default: "in progress",
    },
  },
  { timestamps: true }
);
const Goals = mongoose.model("Goals", goalsSchema);
module.exports = Goals;
