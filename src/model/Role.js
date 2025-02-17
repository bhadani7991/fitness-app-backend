const mongoose = require("mongoose");

/**
 * Role collection to store the user Roles information.
 */
const roleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roles: {
      type: [String],
      enum: ["admin", "user"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Role = mongoose.model("Role", roleSchema);
module.exports = Role;
