import mongoose from "mongoose";

const ReadingSchema = new mongoose.Schema({
  deviceId: { type: String, default: "KMITL-FIGHT-ESP32" },
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  ts: { type: Date, default: () => new Date() }
}, { versionKey: false });

export default mongoose.model("Reading", ReadingSchema);
