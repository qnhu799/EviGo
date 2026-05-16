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

    // 🎯 TÍNH NĂNG MỚI: Mảng lưu trữ danh sách ID các sự kiện yêu thích của người dùng
    savedEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event", // Tham chiếu chính xác tới tên Model trong file Event.js của em
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
