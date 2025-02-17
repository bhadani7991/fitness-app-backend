const express = require("express");
const app = express();
const connectDB = require("./config/database");
const logger = require("./config/logger");
const cookieParser = require("cookie-parser");
require("dotenv").config(); // Load environment variables from .env

// express middleware for json parsing and cookie parsing
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const goalRouter = require("./routes/goal");
const workoutRouter = require("./routes/workout");

app.use("/", authRouter);
app.use("/", goalRouter);
app.use("/", workoutRouter);

/**
 * connecting the database and creating a server with listening port
 */
connectDB()
  .then(() => {
    logger.info("Database connected successfully");
    app.listen(process.env.PORT, () => {
      logger.info(`listening request from the port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    logger.error(`Error occurred during connecting database ${err.message}`);
  });
