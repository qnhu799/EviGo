const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // Đã thêm thư viện bcryptjs

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

    // Băm mật khẩu trước khi lưu vào DB
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let role = "user";
    if (email === "qnhu799@gmail.com") {
      role = "superadmin";
    }

    // Lưu mật khẩu đã băm (hashedPassword)
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

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

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Gmail chưa đăng kí" });
    }

    // So sánh mật khẩu nhập vào với mật khẩu đã băm trong DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu không đúng!" });
    }

    const jwtSecret = process.env.JWT_SECRET || "EviGo_Secret_Key_997";
    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: `Chào mừng ${user.role === "superadmin" ? "Super Admin" : "Evier"} quay trở lại!`,
      token: token,
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

router.put("/update-role", async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });

    if (user.email === "qnhu799@gmail.com") {
      return res.status(403).json({
        message: "Không thể hạ quyền chính mình!",
      });
    }

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

router.get("/all-users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Không thể lấy danh sách thành viên!" });
  }
});

module.exports = router;
