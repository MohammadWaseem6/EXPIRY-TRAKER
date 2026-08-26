const express = require("express");
const {
  createOrder,
  getOrders,
  getOrderById,
  receiveOrder,
  cancelOrder,
} = require("../controllers/orderController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.put("/:id/receive", receiveOrder);
router.put("/:id/cancel", cancelOrder);

module.exports = router;