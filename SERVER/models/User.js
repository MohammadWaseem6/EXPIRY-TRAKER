const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    // Role & Branch fields
    role: {
      type: String,
      enum: ["admin", "storekeeper", "manager", "viewer"],
      default: "viewer",
    },
    branch: {
      type: String,
      enum: ["HQ", "STC", "SPADC"],
      default: "STC",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
