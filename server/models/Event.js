const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    type: String, // Loại sự kiện: âm nhạc, thể thao...
  },
  { timestamps: true },
);

module.exports = mongoose.model("Event", eventSchema);
