const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

app.use(cors());

// --- CẬP NHẬT QUAN TRỌNG: Mở rộng giới hạn để gửi được nhiều ảnh cùng lúc ---
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Cấu hình để trình duyệt có thể truy cập xem ảnh trong thư mục uploads
app.use("/uploads", express.static("uploads"));

// --- KHAI BÁO CÁC TUYẾN ĐƯỜNG ROUTES ---
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const commentRoutes = require("./routes/commentRoutes"); // 🎯 THÊM MỚI: Import module quản lý bình luận

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/comments", commentRoutes); // 🎯 THÊM MỚI: Kích hoạt API đầu cổng nhận bình luận cho EviGo

app.get("/", (req, res) => {
  res.send("🚀 EviGo Server is running smoothly...");
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ EviGo Database Connected!"))
  .catch((err) => console.log("❌ Lỗi kết nối nè Như ơi:", err));

const PORT = process.env.PORT || 5000;
app.use(express.json({ limit: "50mb" }));
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại port ${PORT}`);
});
