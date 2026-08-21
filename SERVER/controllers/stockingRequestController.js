const StockingRequest = require("../models/StockingRequest");
const User = require("../models/User"); 

// Storekeeper creates a stock request
const createStockRequest = async (req, res) => {
  try {
    console.log("User:", req.user);
    console.log("Body:", req.body);

    const { branch, items, reason, notes } = req.body;

    if (!branch || !items || items.length === 0 || !reason) {
      return res.status(400).json({
        error: "Branch, items, and reason are required",
      });
    }

    const request = await StockingRequest.create({
      requestedBy: req.user.id,
      branch,
      items,
      reason,
      notes,
      status: "pending",
    });

    res.status(201).json({
      message: "Stock request created successfully",
      request,
    });
  } catch (error) {
    console.error("Create stock request error:", error);
    res.status(500).json({ error: error.message }); //  Send the actual error message
  }
};

// Manager/Admin views all pending requests
const getPendingRequests = async (req, res) => {
  try {
    const requests = await StockingRequest.find({ status: "pending" })
      .populate("requestedBy", "name email")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error("Get pending requests error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

//  Manager/Admin approves a request
const approveRequest = async (req, res) => {
  try {
    const request = await StockingRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    request.status = "approved";
    request.approvedBy = req.user.id;
    request.approvedAt = new Date();
    await request.save();

    res.json({
      message: "Request approved! Stocking request created.",
      request,
    });
  } catch (error) {
    console.error("Approve request error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

//  Manager/Admin rejects a request
const rejectRequest = async (req, res) => {
  try {
    const request = await StockingRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    request.status = "rejected";
    request.approvedBy = req.user.id;
    request.approvedAt = new Date();
    await request.save();

    res.json({ message: "Request rejected.", request });
  } catch (error) {
    console.error("Reject request error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Storekeeper marks as completed
const completeRequest = async (req, res) => {
  try {
    const request = await StockingRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.status !== "approved") {
      return res
        .status(400)
        .json({ error: "Only approved requests can be completed" });
    }

    request.status = "completed";
    request.completedAt = new Date();
    await request.save();

    res.json({ message: "Request completed.", request });
  } catch (error) {
    console.error("Complete request error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createStockRequest,
  getPendingRequests,
  approveRequest,
  rejectRequest,
  completeRequest,
};
