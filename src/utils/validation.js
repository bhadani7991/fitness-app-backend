const validator = require("validator");
const logger = require("../config/logger");
const { validate } = require("../model/Workout");

const isSaveAllowed = (req) => {
  const userOptions = ["name", "email", "password", "weight", "age"];

  const isSaveAllowed = Object.keys(req.body).every((userField) =>
    userOptions.includes(userField)
  );

  if (!isSaveAllowed) {
    logger.error(`Save not allowed, please check the field`);
    throw new Error(`Save not allowed, please check the field`);
  }
};

const validateSignupData = (req) => {
  const { name, email, password, weight } = req.body;

  if (!name) {
    throw new Error(`name ${name} is not valid`);
  } else if (!validator.isEmail(email)) {
    throw new Error(`Email ${email} is not valid`);
  } else if (!validator.isStrongPassword(password)) {
    throw new Error(`password should be strong, please enter strong password`);
  } else if (!weight) {
    throw new Error(`Please enter correct weight`);
  }
};

const validateEditWorkoutData = (req) => {
  const workoutEditOptions = [
    "type",
    "duration",
    "caloriesBurned",
    "updatedAt",
  ];
  const isUpdateAllowed = Object.keys(req.body).every((userField) =>
    workoutEditOptions.includes(userField)
  );
  return isUpdateAllowed;
};

const isGoalDetailsAllowed = (req) => {
  const goalDetailOption = [
    "workoutsPerWeek",
    "targetWeight",
    "caloriesBurnedGoal",
  ];
  const isGoalDetailsAllowed = Object.keys(req.body).every((goal) =>
    goalDetailOption.includes(goal)
  );
  return isGoalDetailsAllowed;
};

const isGoalDetailsValid = (req) => {
  const { targetWeight, workoutsPerWeek, caloriesBurnedGoal } = req.body;
  if (!targetWeight) {
    throw new Error(`targetWeight : ${targetWeight} is not valid`);
  } else if (!workoutsPerWeek) {
    throw new Error(`workoutsPerWeek : ${workoutsPerWeek} is not valid`);
  } else if (!caloriesBurnedGoal) {
    throw new Error(`caloriesBurnedGoal : ${caloriesBurnedGoal} is not valid`);
  }
};

const isProfileUpdateAllowed = (req) => {
  const profileUpdateAllowedOptions = ["name", "age", "weight", "email"];
  const isProfileUpdatesAllowed = Object.keys(req.body).every((key) =>
    profileUpdateAllowedOptions.includes(key)
  );
  return isProfileUpdatesAllowed;
};

const validateProfileUpdateData = (req) => {
  const { name, age, weight, email } = req.body;
  if (!name) {
    throw new Error(`name : ${name} is not valid`);
  } else if (!age) {
    throw new Error(`age : ${age} is not valid`);
  } else if (!weight) {
    throw new Error(`weight : ${weight} is not valid`);
  } else if (!validator.isEmail(email)) {
    throw new Error(`Email : ${email} is not valid format`);
  }
};

module.exports = {
  isSaveAllowed,
  validateSignupData,
  validateEditWorkoutData,
  isGoalDetailsAllowed,
  isGoalDetailsValid,
  isProfileUpdateAllowed,
  validateProfileUpdateData,
};
