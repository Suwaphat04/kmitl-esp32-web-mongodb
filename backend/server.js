import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Reading from "./models/Reading.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 8080;

if (!MONGODB_URI) {
  console.error("ERROR: Missing MONGODB_URI env var");
  process.exit(1);
}

try {
  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB connected");
} catch (err) {
  console.error("MongoDB connection error:", err.message);
  process.exit(1);
}

// Health
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Create reading (from ESP32 or test clients)
app.post("/api/readings", async (req, res) => {
  try {
    const { deviceId = "KMITL-FIGHT-ESP32", temperature, humidity, ts } = req.body;
    if (typeof temperature !== "number" || typeof humidity !== "number") {
      return res.status(400).json({ error: "temperature and humidity must be numbers" });
    }
    const reading = await Reading.create({
      deviceId,
      temperature,
      humidity,
      ts: ts ? new Date(ts) : new Date()
    });
    res.status(201).json(reading);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save reading" });
  }
});

// Get latest reading
app.get("/api/readings/latest", async (req, res) => {
  try {
    const reading = await Reading.findOne().sort({ ts: -1 });
    if (!reading) return res.status(404).json({ error: "No readings yet" });
    res.json(reading);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch latest reading" });
  }
});

// List readings (optional pagination)
app.get("/api/readings", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);
    const readings = await Reading.find().sort({ ts: -1 }).limit(limit);
    res.json(readings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch readings" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
