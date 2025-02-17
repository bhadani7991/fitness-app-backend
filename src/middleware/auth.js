const jwt = require("jsonwebtoken");
const User = require("../model/User");
const logger = require("../config/logger");

/**
 * Middleware for user Authentication.
 */
const userAuth = async (req, res, next) => {
  try {
    //get the token from the cookies
    const { token } = req.cookies;
    if (!token) {
      logger.error(`Invalid Credentials `);
      throw new Error(`Invalid Credentials`);
    }
    const decodedObject = await jwt.verify(token, process.env.SECRET_KEY);
    const { _id } = decodedObject;
    const user = await User.findById(_id);
    if (!user) {
      logger.error("User is not valid");
      throw new Error(`User is not Valid!!`);
    }
    logger.info(`User is Authenticated Successfully`);
    req.user = user;
    next();
  } catch (error) {
    logger.error(`Error ${error.message}`);
    res.status(400).json({
      message: `Error : ${error.message}`,
    });
  }
};

module.exports = {
  userAuth,
};
