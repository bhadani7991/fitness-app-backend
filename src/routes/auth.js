const express = require("express");

const router = express.Router();

/**
 * Api to register the user.
 */
router.post("/signup", async (req, res) => {
  // write the logic to handle signup logic
  res.send("User Registered successfully");
});

module.exports = router;
