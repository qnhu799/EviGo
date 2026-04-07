const mongoose = require("mongoose");

// Đây là "Cái khuôn" để tạo ra một người dùng mới
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true, // Bắt buộc phải có tên
      unique: true, // Không được trùng tên với người khác
    },
    email: {
      type: String,
      required: true,
      unique: true, // Mỗi email chỉ được đăng ký 1 tài khoản
    },
    password: {
      type: String,
      required: true, // Bắt buộc phải có mật khẩu
    },
  },
  {
    timestamps: true, // Tự động ghi lại ngày giờ Như tạo tài khoản
  },
);

module.exports = mongoose.model("User", userSchema);
