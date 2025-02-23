const express = require("express");
const app = express();
const connectDB = require("./config/database");
const logger = require("./config/logger");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config(); // Load environment variables from .env

// express middleware for json parsing and cookie parsing
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const goalRouter = require("./routes/goal");
const workoutRouter = require("./routes/workout");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", goalRouter);
app.use("/", workoutRouter);
app.use("/", userRouter);

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
