const mongoose = require("mongoose");

const stockingRequestSchema = new mongoose.Schema(
  {
    requestNumber: { type: String, unique: true },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    branch: {
      type: String,
      enum: ["HQ", "STC", "SPADC", "SABIC"],
      required: true,
    },
    items: [
      {
        name: { type: String, required: true },
        category: { type: String },
        quantity: { type: Number, required: true, default: 1 },
        notes: { type: String },
      },
    ],
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: { type: Date },
    completedAt: { type: Date },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// ✅ FIXED – regular function, NOT arrow function
stockingRequestSchema.pre("save", function (next) {
  // Generate a unique request number if it doesn't exist
  if (!this.requestNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.requestNumber = `SR-${year}${month}${day}-${random}`;
  }
  next(); // ✅ Must call next() to continue the save operation
});

module.exports = mongoose.model("StockingRequest", stockingRequestSchema);