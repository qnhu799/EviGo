const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// 🎯 ĐỒNG BỘ ĐỘC QUYỀN: Bóc tách chính xác hàm protect từ Middleware gốc của Như
const { protect } = require("../authMiddleware");

// Định nghĩa cấu trúc Schema lưu vào MongoDB
const commentSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userStringName: {
    // 🎯 LƯU TRỮ TÊN CỨNG: Để Frontend hiển thị ngay lập tức không bị phụ thuộc vào populate lỗi
    type: String,
    default: "Người dùng EviGo",
  },
  content: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Comment =
  mongoose.models.Comment || mongoose.model("Comment", commentSchema);

// 🎯 API LẤY DANH SÁCH BÌNH LUẬN (Công khai công cộng)
router.get("/event/:eventId", async (req, res) => {
  try {
    const list = await Comment.find({ event: req.params.eventId })
      .populate("user", "name email displayName username")
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error("Lỗi GET comments:", err.message);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ không thể lấy danh sách đánh giá!" });
  }
});

// 🎯 API THÊM MỚI BÌNH LUẬN: Đóng dấu lưu tên chữ thời gian thực từ Middleware protect
router.post("/add", protect, async (req, res) => {
  try {
    const { eventId, content, rating } = req.body;

    if (!content || !content.trim()) {
      return res
        .status(400)
        .json({ message: "Nội dung bình luận không được để trống!" });
    }

    // Lấy ID người dùng sạch sẽ đã qua xử lý của hàm protect
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Không tìm thấy thông tin tài khoản hợp lệ!" });
    }

    // 🎯 THUẬT TOÁN BẮT TÊN THÔNG MINH CỦA NHƯ:
    // Nếu req.user.username trống, bóc luôn phần chữ trước dấu '@' trong Email làm tên hiển thị
    let usernameFromToken =
      req.user?.username || req.user?.name || req.user?.displayName;

    if (!usernameFromToken || usernameFromToken === "Người dùng EviGo") {
      const userEmail = req.user?.email || "";
      if (userEmail && userEmail.includes("@")) {
        usernameFromToken = userEmail.split("@")[0]; // Ví dụ: "test@gmail.com" -> bóc ra chuỗi "test"
      } else {
        usernameFromToken = "Người dùng EviGo";
      }
    }

    let comment = new Comment({
      event: eventId,
      user: userId,
      userStringName: usernameFromToken, // 🎯 LƯU CỨNG: Gán thẳng chuỗi tên (hoặc chuỗi email bóc tách) vào DB
      content,
      rating: Number(rating) || 5,
    });

    await comment.save();

    // Nạp kèm thông tin liên kết bảng để backup dữ liệu
    comment = await comment.populate("user", "name email displayName username");

    res
      .status(201)
      .json({ message: "Đăng tải đánh giá thành công! ✨", comment });
  } catch (err) {
    console.error("Lỗi POST comment:", err.message);
    res
      .status(500)
      .json({ message: "Không thể lưu bình luận, thử lại sau Như nhé!" });
  }
});

module.exports = router;
