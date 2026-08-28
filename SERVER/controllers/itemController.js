const Item = require("../models/Item");

// CREATE ITEM
const createItem = async (req, res) => {
  try {
    console.log("Creating item with user:", req.user);
    console.log("Body:", req.body);

    const { name, category, expiryDate, quantity, price } = req.body;

    if (!name || !category || !expiryDate) {
      return res.status(400).json({
        error: "Name, category, and expiry date are required",
      });
    }

    const item = await Item.create({
      name,
      category,
      expiryDate,
      quantity: quantity || 0,
      price: price || 0,
      user: req.user.id,
    });

    res.status(201).json({
      message: "Item Created Successfully!",
      item,
    });
  } catch (error) {
    console.error("Create item error:", error);
    res.status(500).json({ error: "Server error while creating item" });
  }
};

// GET ALL ITEMS
const getItems = async (req, res) => {
  try {
    const items = await Item.find({
      user: req.user.id,
    }).sort({ expiryDate: 1 });

    res.json(items);
  } catch (error) {
    console.error("Get items error:", error);
    res.status(500).json({ error: "Server error while fetching items" });
  }
};

// DELETE ITEM
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!item) {
      return res.status(404).json({
        error: "Item not found or not authorized",
      });
    }

    res.json({
      message: "Item Deleted successfully",
    });
  } catch (error) {
    console.error("Delete item error:", error);
    res.status(500).json({ error: "Server error while deleting item" });
  }
};

// UPDATE ITEM
const updateItem = async (req, res) => {
  try {
    const { name, category, expiryDate } = req.body;
    const itemId = req.params.id;

    const item = await Item.findOne({ _id: itemId, user: req.user.id });

    if (!item) {
      return res.status(404).json({
        error: "No item found or unauthorized",
      });
    }

    // Update only the fields that are provided
    if (name) item.name = name;
    if (category) item.category = category; // ✅ fixed spelling
    if (expiryDate) item.expiryDate = expiryDate;

    await item.save();

    res.json({
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    console.error("Update item error:", error);
    res.status(500).json({ error: "Server error while updating item" });
  }
};

module.exports = { createItem, getItems, deleteItem, updateItem }; // ✅ consistent naming
