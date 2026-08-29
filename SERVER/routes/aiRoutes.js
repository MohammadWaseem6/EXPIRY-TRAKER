const express = require("express");
const multer = require("multer");
const fs = require("fs");
const authMiddleware = require("../middleware/auth");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/extract-items", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // Read image
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString("base64");
    fs.unlinkSync(req.file.path);

    // ✅ SIMPLE: Use the most basic working model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Extract items from this delivery note. 
      Return ONLY a JSON array with: name, category, expiryDate, quantity, price.
      Example: [{"name":"Milk","category":"Dairy","expiryDate":"2026-09-15","quantity":10,"price":4.99}]`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
    ]);

    const text = result.response.text();
    console.log("AI Response:", text);

    // Try to parse JSON
    let items = [];
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        items = JSON.parse(jsonMatch[0]);
      } else {
        items = JSON.parse(text);
      }
    } catch (e) {
      // If JSON parsing fails, return raw text
      return res.json({
        success: false,
        raw: text,
        message: "Could not parse as JSON. Please try again."
      });
    }

    res.json({
      success: true,
      items: items,
      count: items.length,
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ 
      error: error.message,
      suggestion: "Try using a different image or check your API key"
    });
  }
});

module.exports = router;