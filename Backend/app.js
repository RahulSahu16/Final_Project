import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import homeRoutes from "./routes/homeRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/homes", homeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", aiRoutes);
app.use("/api", propertyRoutes);

// ✅ MongoDB Connection
mongoose.connect(process.env.Mongo_DB_URL)
  .then(() => {
    console.log("✅ MongoDB Connected");
    console.log("👉 DB Name:", mongoose.connection.name);
  })
  .catch((err) => {
    console.log("❌ Mongo Error:", err);
  });

// ✅ Simple Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ Test DB Insert Route
app.get("/test-db", async (req, res) => {
  try {
    const testSchema = new mongoose.Schema({ name: String });
    const Test = mongoose.model("Test", testSchema);

    const data = await Test.create({ name: "Rahul Test Data" });

    res.json({
      message: "Data inserted successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port https://localhost:${PORT}`);
});