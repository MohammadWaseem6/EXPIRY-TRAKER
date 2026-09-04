const User = require("../models/User");
const bcrypt = require("bcrypt");

// Get all users (Admin only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password_hash");
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Server error while fetching users" });
  }
};

// Update a user (Admin only)
const updateUser = async (req, res) => {
  try {
    const { role, branch, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (role) user.role = role;
    if (branch) user.branch = branch;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    const updatedUser = await User.findById(req.params.id).select(
      "-password_hash",
    );
    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Server error while updating user" });
  }
};

// Delete a user (Admin only – prevent deleting yourself)
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId === req.user.id) {
      return res.status(400).json({ error: "You cannot delete yourself" });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Server error while deleting user" });
  }
};

// Invite new user (Admin only – NO EMAIL)
const inviteUser = async (req, res) => {
  try {
    const { name, email, role, branch } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(tempPassword, saltRounds);

    const user = await User.create({
      name,
      email,
      password_hash,
      role: role || "viewer",
      branch: branch || "HQ",
      isActive: true,
    });

    //  No email sent — just return the user with temp password
    const newUser = await User.findById(user._id).select("-password_hash");
    res.status(201).json({
      message: "User invited successfully",
      user: newUser,
      tempPassword, // Return temp password so admin can share it manually
    });
  } catch (error) {
    console.error("Invite user error:", error);
    res.status(500).json({ error: "Server error while inviting user" });
  }
};

module.exports = { getUsers, updateUser, deleteUser, inviteUser };
