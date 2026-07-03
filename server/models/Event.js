const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String },
    ticketPrice: { type: String},

    locations: [
      {
        address: { type: String },
        district: { type: String },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    ],

    images: [{ type: String }],
    image: { type: String },

    startDate: { type: Date },
    endDate: { type: Date },
    isPermanent: { type: Boolean, default: false },
    closedDays: [{ type: Number }],
    isAllDay: { type: Boolean, default: false },
    dailyOpeningTime: { type: String },
    dailyClosingTime: { type: String },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    userContributedId: {
      type: String,
      default: "",
    },
    userContributedMongoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    contributor: {
      userId: { type: String, default: "" },
      userIdStr: { type: String, default: "" },
      name: { type: String, default: "User EviGo" },
      displayName: { type: String, default: "User EviGo" },
      contact: { type: String, default: "" },
    },

    averageRating: {
      type: Number,
      default: 5.0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Event", eventSchema);
