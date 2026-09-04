const express = require("express");
const {
  createItem,
  getItems,
  deleteItem,
  updateItem,
  releaseItem,        // ADD THIS
} = require("../controllers/itemController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createItem);
router.get("/", getItems);
router.put("/:id", updateItem);
router.put("/:id/release", releaseItem);    
router.delete("/:id", deleteItem);

module.exports = router;