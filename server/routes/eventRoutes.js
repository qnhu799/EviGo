const express = require("express");
const router = express.Router();
const {
  protect,
  adminOnly,
  canContribute,
} = require("../authMiddleware");

// 1. DÀNH CHO KHÁCH (User/Guest): Chỉ được xem
router.get("/all", async (req, res) => {
  res.json({ message: "Danh sách sự kiện cho mọi người xem!" });
});

// 2. DÀNH CHO THÀNH VIÊN ĐÓNG GÓP (Organizer): Được thêm sự kiện
router.post("/add", protect, canContribute, async (req, res) => {
  try {
    res.json({ message: "Thành viên đã đóng góp sự kiện thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm sự kiện rồi Như ơi!" });
  }
});

// 3. DÀNH CHO ADMIN: Toàn quyền
router.delete("/delete/:id", protect, adminOnly, async (req, res) => {
  try {
    res.json({ message: "Admin đã xóa sự kiện thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ rồi Như ơi!" });
  }
});

module.exports = router;
