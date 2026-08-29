const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload-file", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    let items = [];

    if (ext === ".xlsx" || ext === ".xls" || ext === ".csv") {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      console.log("📊 Column Names:", Object.keys(jsonData[0] || {}));
      console.log("📊 First row:", jsonData[0]);

      // ✅ SIMPLE: Just take any column that looks like a name
      const firstRow = jsonData[0] || {};
      const keys = Object.keys(firstRow);
      
      // Find the first column that might contain product names
      const nameKey = keys.find(k => 
        k.toLowerCase().includes("name") || 
        k.toLowerCase().includes("product") || 
        k.toLowerCase().includes("item")
      ) || keys[0]; // fallback to first column

      items = jsonData
        .filter(row => {
          const val = row[nameKey];
          return val && val.toString().trim() !== "";
        })
        .map(row => {
          const name = row[nameKey].toString().trim();
          
          // Try to find quantity and price from other columns
          let quantity = 1;
          let price = 0;
          let category = "Uncategorized";

          for (const key of keys) {
            const val = row[key];
            if (typeof val === "number") {
              if (key.toLowerCase().includes("qty") || key.toLowerCase().includes("quantity")) {
                quantity = val;
              } else if (key.toLowerCase().includes("price") || key.toLowerCase().includes("cost")) {
                price = val;
              }
            }
            if (key.toLowerCase().includes("category") || key.toLowerCase().includes("type")) {
              category = val || "Uncategorized";
            }
          }

          return {
            name: name,
            category: category,
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            quantity: quantity || 1,
            price: price || 0,
            source: "excel",
          };
        });
    } else {
      return res.status(400).json({ error: "Please upload an Excel file (.xlsx, .xls, or .csv)" });
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      items: items,
      count: items.length,
      message: `Extracted ${items.length} items`,
    });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message || "Failed to process file" });
  }
});

module.exports = router;