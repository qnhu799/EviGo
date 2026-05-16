const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String },
    ticketPrice: { type: String },

    // 1. Hỗ trợ nhiều địa điểm (Mảng locations)
    locations: [
      {
        address: { type: String },
        district: { type: String },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    ],

    // 2. Hỗ trợ Album many ảnh
    images: [{ type: String }],
    image: { type: String }, // Ảnh đại diện chính (Cover)

    // 3. Các trường quản lý thời gian linh hoạt
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

    // --- Quản lý người duyệt để hiện số bài Admin đã duyệt ---
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Tham chiếu tới model User.js của em
      default: null,
    },

    // 🎯 ĐOẠN KHAI BÁO BẢO HIỂM PHẲNG: Cho phép Mongoose chấp nhận lưu trường ID phẳng ngoài cùng tầng
    userContributedId: {
      type: String,
      default: "",
    },
    userContributedMongoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // --- 🎯 CẬP NHẬT: MỞ RỘNG ĐỊNH NGHĨA TRƯỜNG ID LỒNG CHỐNG BỊ NUỐT DỮ LIỆU ---
    contributor: {
      userId: { type: String, default: "" }, // Khai báo rõ ràng dạng String để Mongoose ko chặn
      userIdStr: { type: String, default: "" }, // Trường dự phòng lưu chuỗi chữ thường
      name: { type: String, default: "User EviGo" },
      displayName: { type: String, default: "User EviGo" },
      contact: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Event", eventSchema);
