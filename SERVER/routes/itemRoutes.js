const express = require("express");
const {
  createItem,
  getItems,
  deleteItem,
  UpdateItems,
} = require("../controllers/itemController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// All item routes require authentication
router.use(authMiddleware);

router.post("/", createItem);
router.get("/", getItems);
router.delete("/:id", deleteItem);
router.put("/:id", UpdateItems);

module.exports = router;
