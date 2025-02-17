const validator = require("validator");
const logger = require("../config/logger");

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
  const workoutEditOptions = ["type", "duration", "caloriesBurned", "date"];
  const isUpdateAllowed = Object.keys(req.body).every((userField) =>
    workoutEditOptions.includes(userField)
  );
  return isUpdateAllowed;
};

module.exports = {
  isSaveAllowed,
  validateSignupData,
  validateEditWorkoutData,
};
