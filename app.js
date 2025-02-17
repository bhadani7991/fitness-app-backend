const express = require("express");
const app = express();
const connectDB = require("./src/config/database");
const logger = require("./src/config/logger");

app.use(express.json());

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
