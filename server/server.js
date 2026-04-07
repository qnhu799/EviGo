require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const app = express();

app.use(express.json());
app.use(cors());

// 1. Kết nối cơ sở dữ liệu (Database)
const dbURI = process.env.MONGODB_URI;
mongoose
  .connect(dbURI)
  .then(() => console.log("✅ Chúc mừng Evi-er! Kết nối thành công!"))
  .catch((err) => console.log("❌ Lỗi kết nối rồi Evi-er ơi: ", err));

// --- THÊM MỚI: CẤU HÌNH GỬI MAIL ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// -----------------------------------------------------------
// 2. PHẦN QUẢN LÝ NGƯỜI DÙNG (USER)
// -----------------------------------------------------------

// API Đăng ký tài khoản mới
app.post("/api/register", async (req, res) => {
  try {
    const User = require("./models/User");
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res
        .status(400)
        .json({ message: "Email này đã có người dùng rồi Evi-er ơi!" });

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({ message: "🎉 Đăng ký EviGo thành công rồi nè!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// API Đăng nhập
app.post("/api/login", async (req, res) => {
  try {
    const User = require("./models/User");
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ message: "Email không tồn tại Evi-er ơi!" });

    if (user.password !== password) {
      return res.status(400).json({ message: "Mật khẩu sai rồi nè!" });
    }

    const token = jwt.sign({ id: user._id }, "EviGo_Secret_Key_2026", {
      expiresIn: "1d",
    });

    res.json({
      message: `Chào mừng ${user.username} quay trở lại!`,
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- THÊM MỚI: API QUÊN MẬT KHẨU ---
app.post("/api/forgot-password", async (req, res) => {
  try {
    const User = require("./models/User");
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(400)
        .json({ message: "Email này chưa có trong hệ thống Evi-er ơi!" });

    const otp = Math.floor(100000 + Math.random() * 900000);

    const mailOptions = {
      from: `"EviGo Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Mã OTP khôi phục mật khẩu EviGo",
      html: `<div style="border: 2px solid #280d8c; padding: 20px; border-radius: 10px; font-family: Arial;">
              <h2 style="color: #280d8c;">Chào ${user.username}!</h2>
              <p>Mã OTP khôi phục mật khẩu của Evi-er là: <b style="font-size: 24px; color: #635bff;">${otp}</b></p>
              <p>Mã có hiệu lực trong 10 phút nhé Evi-er!</p>
            </div>`,
    };

    await transporter.sendMail(mailOptions);
    res.json({
      message: "Mã xác thực đã sẵn sàng! Kiểm tra email ngay nhé Evi-er ơi!",
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi gửi mail: " + err.message });
  }
});

// -----------------------------------------------------------
// 3. PHẦN QUẢN LÝ SỰ KIỆN (EVENTS)
// -----------------------------------------------------------

app.get("/api/events", async (req, res) => {
  try {
    const Event = require("./models/Event");
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/events", async (req, res) => {
  try {
    const Event = require("./models/Event");
    const newEvent = new Event(req.body);
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// -----------------------------------------------------------
// 4. KHỞI CHẠY SERVER (Luôn để ở cuối cùng)
// -----------------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server EviGo đang chạy rực rỡ tại: http://localhost:${PORT}`);
});
