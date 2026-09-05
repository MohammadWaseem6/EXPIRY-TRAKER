const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const userRoutes = require("./routes/userRoutes");
const aiRoutes = require("./routes/aiRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// FIXED CORS - Allow your Render backend URL
app.use(
  cors({
    origin: [
      "https://expiry-traker.onrender.com",  // Your backend URL
      "http://localhost:5173",                // Local frontend
      "http://localhost:5001",                // Local backend
      "https://your-frontend.vercel.app"      // Your Vercel frontend (add this)
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`📍 ${PORT === 5001 ? 'Local' : 'Production'} mode`);
});