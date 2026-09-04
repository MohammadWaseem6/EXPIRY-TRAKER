const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true, default: 0 },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    supplierName: { type: String, required: true, trim: true },
    orderDate: { type: Date, default: Date.now },
    expectedDeliveryDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "received", "cancelled"],
      default: "pending",
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, default: 0 },
    notes: { type: String, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// ✅ CORRECT – regular function with next
orderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.orderNumber = `ORD-${year}${month}${day}-${random}`;
  }
  this.totalAmount = this.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );
  next();
});

module.exports = mongoose.model("Order", orderSchema);
