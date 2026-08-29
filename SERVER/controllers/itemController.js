const Item = require("../models/Item");

// CREATE ITEM
const createItem = async (req, res) => {
  try {
    const {
      name,
      category,
      expiryDate,
      purchaseDate,
      quantity,
      price,
      unit,
      isAllergen,
      source,
    } = req.body;

    const item = await Item.create({
      name: name || "Unknown",
      category: category || "Uncategorized",
      expiryDate: expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      purchaseDate: purchaseDate || new Date(),
      quantity: quantity || 1,
      price: price || 0,
      unit: unit || "",
      isAllergen: isAllergen || false,
      source: source || "manual",
      user: req.user.id,
    });

    res.status(201).json({ message: "Item Created Successfully!", item });
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
