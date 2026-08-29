const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,  // optional
      trim: true,
      default: "Unknown",
    },
    category: {
      type: String,
      required: false,  // optional
      trim: true,
      default: "Uncategorized",
    },
    expiryDate: {
      type: Date,
      required: false,  // optional
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    purchaseDate: {
      type: Date,
      required: false,
      default: Date.now,
    },
    quantity: {
      type: Number,
      required: false,
      default: 1,
      min: 0,
    },
    price: {
      type: Number,
      required: false,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    isAllergen: {
      type: Boolean,
      required: false,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,  // ✅ still required – links item to user
    },
    // Optional: track source (manual, excel, ai, etc.)
    source: {
      type: String,
      enum: ["manual", "excel", "pdf", "ai", "bulk"],
      default: "manual",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Item", itemSchema);