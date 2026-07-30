const Item = require("../models/Item");

const createItem = async (req, res) => {
  try {
    console.log("User from token:", req.user);
    const { name, categeory, expiryDate } = req.body;
    if (!(name || categeory || expiryDate)) {
      return res.status(404).json({
        error: "Name, category, and expiry date are required",
      });
    }
    const item = await Item.create({
      name,
      category,
      expiryDate,
      user: req.user.id, // comes from authMiddleware
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

//get items
const getItems = async (req, rea) => {
  try {
    const items = await Item.find({
      user: req.user.id,
    }).sort({ expiryDate: 1 });
    res.json(item);
  } catch (error) {}
};

//delete itemss, usig id
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete({
      _id: req.params.id,
      user: req.user.id, // check items belongs to that user or not
    });
    if (!item) {
      return res.status(404).json({
        error: "Item not found or not authorized",
      });
    }
    res.json({
      message: "Item Deleted successfully..",
    });
  } catch (error) {
    console.error("Delete item error:", error);
    res.status(500).json({ error: "Server error while deleting item" });
  }
};
//update items
const UpdateItems = async (req, res) => {
  try {
    const { name, categeory, expiryDate } = req.body;
    const ItemId = req.params.id;
    //find item and make sure item belongs to a user
    const item = await user.findOne({ _id: ItemId, user: req.user.id });
    if (!item) {
      res.status(404).json({
        error: "no item found or unauthorized",
      });
    }
    //update wahi fields kro jo provided hai
    if (name) item.name = name;
    if (categeory) item.categeory = categeory;
    if (expiryDate) item.expiryDate = expiryDate;
    await item.save();
    res.json({
      message: "item updated successfully",
      item,
    });
  } catch (error) {
    console.error("Update item error:", error);
    res.status(500).json({ error: "Server error while updating item" });
  }
};

module.exports = { createItem, getItems, deleteItem, UpdateItems };
