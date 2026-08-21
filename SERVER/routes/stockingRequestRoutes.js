const express = require("express");
const {
  createStockRequest,
  getPendingRequests,
  approveRequest,
  rejectRequest,
  completeRequest,
} = require("../controllers/stockingRequestController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

// Storekeeper
router.post("/", createStockRequest);

// Manager / Admin
router.get("/pending", getPendingRequests);
router.put("/:id/approve", approveRequest);
router.put("/:id/reject", rejectRequest);

// Storekeeper
router.put("/:id/complete", completeRequest);

module.exports = router;