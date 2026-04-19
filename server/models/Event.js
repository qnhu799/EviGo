const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    type: { type: String },
    district: { type: String },
    address: { type: String },
    date: { type: Date },
    time: { type: String },
    ticketPrice: { type: String },
    image: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    contributor: {
      name: { type: String },
      contact: { type: String },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Event", eventSchema);
