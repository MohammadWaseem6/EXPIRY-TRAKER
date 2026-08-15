const express = require("express");
const {
  getUsers,
  updateUser,
  deleteUser,
  inviteUser,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/", getUsers);
router.post("/invite", inviteUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;