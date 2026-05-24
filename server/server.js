const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/uploads", express.static("uploads"));

// 🎯 NẠP CÁC FILE ROUTER
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
// 🚀 ĐÃ SỬA TÊN FILE: Đổi từ "comments" thành "commentRoutes" cho khớp với cây thư mục của Như
const commentRoutes = require("./routes/commentRoutes");

// 🎯 KHAI BÁO CÁC ĐƯỜNG DẪN API (Đã thông luồng bình luận)
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/comments", commentRoutes);

app.get("/", (req, res) => {
  res.send("🚀 EviGo Server is running smoothly...");
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ EviGo Database Connected!"))
  .catch((err) => console.log("❌ Lỗi kết nối nè Như ơi:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại port ${PORT}`);
});
