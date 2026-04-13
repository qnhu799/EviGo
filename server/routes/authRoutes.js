const express = require("express");
const router = express.Router();
const User = require("../models/User");

// 1. Tuyến đường ĐĂNG KÝ (Register)
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message:
          "Email này đã được đăng ký rồi Evier ơi! Thử đăng nhập xem sao nhé.",
      });
    }

    let role = "user";
    if (email === "qnhu799@gmail.com") {
      role = "superadmin";
    }

    const user = await User.create({ username, email, password, role });

    res.status(201).json({
      message:
        role === "superadmin"
          ? "Chào mừng Super Admin!"
          : "Đăng ký thành công!",
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server đăng ký: " + error.message });
  }
});

// 2. Tuyến đường ĐĂNG NHẬP (Login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Gmail chưa đăng kí" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Mật khẩu không đúng!" });
    }

    res.status(200).json({
      message: `Chào mừng ${user.role === "superadmin" ? "Super Admin" : "Evier"} quay trở lại!`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server đăng nhập: " + error.message });
  }
});

// 3. API CẬP NHẬT QUYỀN
router.put("/update-role", async (req, res) => {
  try {
    const { userId } = req.body;

    // Tìm user để kiểm tra role hiện tại
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });

    // QC bảo vệ: Không cho phép hạ quyền chính mình
    if (user.email === "qnhu799@gmail.com") {
      return res
        .status(403)
        .json({
          message:
            "Quyền trùm cuối là bất biến, Như không thể hạ quyền chính mình!",
        });
    }

    // LOGIC: Nếu đang là admin thì xuống user, ngược lại thì lên admin
    const newRole = user.role === "admin" ? "user" : "admin";

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true },
    ).select("-password");

    res.json({
      message: `Đã đổi thành ${newRole === "admin" ? "Quản trị viên" : "Thành viên"} thành công!`,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cấp quyền rồi Evier ơi!" });
  }
});

// 4. API LẤY TẤT CẢ THÀNH VIÊN
router.get("/all-users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Không thể lấy danh sách thành viên!" });
  }
});

module.exports = router;
