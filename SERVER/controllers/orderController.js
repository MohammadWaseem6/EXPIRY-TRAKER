const Order = require("../models/Order");
const Item = require("../models/Item");

//  Create a new order
const createOrder = async (req, res) => {
  try {
    const { supplierName, orderDate, expectedDeliveryDate, items, notes } = req.body;

    if (!supplierName || !items || items.length === 0) {
      return res.status(400).json({ error: "Supplier and at least one item required" });
    }

    const order = await Order.create({
      supplierName,
      orderDate: orderDate || Date.now(),
      expectedDeliveryDate,
      items,
      notes,
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

//  Get all orders (user-specific)
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ createdBy: req.user.id })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get a single order
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    }).populate("createdBy", "name email");
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

//  Mark order as received and add items to inventory
const receiveOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status === "received") {
      return res.status(400).json({ error: "Order already received" });
    }

    // Add items to inventory
    for (const item of order.items) {
      await Item.create({
        name: item.name,
        category: item.category || "Uncategorized",
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // default 30 days
        purchaseDate: new Date(),
        price: item.price,
        user: req.user.id,
        location: req.body.branch || "HQ",
        addedBy: req.user.id,
      });
    }

    order.status = "received";
    await order.save();

    res.json({ message: "Order received successfully", order });
  } catch (error) {
    console.error("Receive order error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

//  Cancel an order
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status === "received") {
      return res.status(400).json({ error: "Cannot cancel a received order" });
    }

    order.status = "cancelled";
    await order.save();

    res.json({ message: "Order cancelled", order });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createOrder, getOrders, getOrderById, receiveOrder, cancelOrder };