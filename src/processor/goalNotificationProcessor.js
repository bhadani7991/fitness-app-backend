const cron = require("node-cron");
const logger = require("../config/logger");
const User = require("../model/User");
const Goals = require("../model/Goal");

const { startOfWeek } = require("date-fns/startOfWeek");
const { endOfWeek } = require("date-fns/endOfWeek");
const Workout = require("../model/Workout");
const sendEmail = require("../config/emailConfig");

cron.schedule("0 8 * * *", checkGoalsAndNotify);
// Function to check goals and send notifications
async function checkGoalsAndNotify() {
  try {
    //Get All Users
    const users = await User.find();
    logger.info(`Fetched User Details Successfully ${users}`);
    for (const user of users) {
      const today = new Date();
      const startWeekDate = startOfWeek(today, { weekStartsOn: 0 });
      const endOfWeekDate = endOfWeek(today, { weekStartsOn: 0 });
      const goal = await fetchCurrentActiveGoalForUser(
        user,
        startWeekDate,
        endOfWeekDate
      );
      logger.info("Successfully fetched goal for the user");
      if (!goal) {
        return;
      }
      const workouts =
        (await fetchWorkoutsForCurrentWeek(
          user,
          startWeekDate,
          endOfWeekDate
        )) ?? [];
      if (!workouts) {
        return;
      }
      logger.info(workouts);
      logger.info("Successfully fetched workouts details");

      // Calculate progress
      const workoutsCompleted = workouts.length;
      const caloriesBurned = workouts?.reduce(
        (sum, workout) => sum + workout.caloriesBurned,
        0
      );

      //fetch user details for current weight
      const userDetails = await User.findOne({
        _id: user._id,
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
      if (latestWeight === goal.targetWeight) return 100; // Goal achieved

      const weightProgress =
        goal.targetWeight > latestWeight
          ? (latestWeight / goal.targetWeight) * 100 // Weight gain goal
          : (goal.targetWeight / latestWeight) * 100; // Weight loss goal

      if (
        workoutProgress == 100.0 &&
        caloriesBurned === 100.0 &&
        weightProgress === 100.0
      ) {
        sendEmail.run(
          user.email,
          `${user.name} : Congratulations! You've achieved your goal`
        );
        logger.info("Successfully sent email to the User");
      } else if (
        workoutProgress >= 90 ||
        caloriesProgress >= 90 ||
        weightProgress >= 90
      ) {
        sendEmail.run(
          user.email,
          `${user.name} : You're close to achieving your goal!`
        );
      }
    }
  } catch (error) {
    logger.error("Error checking goals and sending notifications:", error);
  }
}

const fetchCurrentActiveGoalForUser = async (
  user,
  startWeekDate,
  endOfWeekDate
) => {
  try {
    // Fetch latest goal
    const goal = await Goals.findOne({
      userId: user._id,
      updatedAt: { $gte: startWeekDate, $lte: endOfWeekDate },
    }).sort({ updatedAt: -1 });

    if (!goal) {
      logger.error(
        `No fitness goals found for user ${user._id}, please set Goal`
      );
      return;
    }
    return goal;
  } catch (error) {
    logger.error(
      `Error while fetching current ActiveGoal For User ${error.message}`
    );
  }
};

const fetchWorkoutsForCurrentWeek = async (
  user,
  startWeekDate,
  endOfWeekDate
) => {
  try {
    // Fetch workouts from this week
    const workouts = await Workout.find({
      userId: user._id,
      updatedAt: { $gte: startWeekDate, $lte: endOfWeekDate },
    });
    if (workouts.length == 0 || !workouts) {
      logger.error("No Workout find for current week ");
      return;
    }

    return workouts;
  } catch (error) {
    logger.error(
      `Error while fetching Workouts For the Current Week ${error.message}`
    );
  }
};
