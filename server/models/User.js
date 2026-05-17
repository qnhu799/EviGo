const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "organizer", "admin", "superadmin"],
      default: "user",
    },

    // 🎯 TÍNH NĂNG ĐỒNG BỘ: Mảng lưu trữ danh sách ID các sự kiện yêu thích của RIÊNG TỪNG TÀI KHOẢN
    savedEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event", // Tham chiếu chính xác tới tên Model trong file Event.js phục vụ lệnh liên thông dữ liệu (.populate)
      },
    ],
  },
  {
    timestamps: true, // Tự động quản lý hai trường createdAt và updatedAt cho tài khoản
  },
);

module.exports = mongoose.model("User", userSchema);
