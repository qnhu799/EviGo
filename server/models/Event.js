const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String },
    ticketPrice: { type: String },

    // 1. CẬP NHẬT: Hỗ trợ nhiều địa điểm (Mảng locations)
    locations: [
      {
        address: { type: String },
        district: { type: String },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    ],

    // 2. CẬP NHẬT: Hỗ trợ Album nhiều ảnh
    images: [{ type: String }],
    image: { type: String }, // Giữ lại làm ảnh đại diện chính (Cover)

    // 3. THÊM MỚI: Các trường quản lý thời gian linh hoạt
    startDate: { type: Date },
    endDate: { type: Date },
    isPermanent: { type: Boolean, default: false }, // Luôn mở cửa hằng tuần
    closedDays: [{ type: Number }], // Các thứ nghỉ trong tuần (0: CN, 1: T2...)
    isAllDay: { type: Boolean, default: false }, // Mở cửa 24/24
    dailyOpeningTime: { type: String },
    dailyClosingTime: { type: String },

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
