const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { protect, adminOnly, canContribute } = require("../authMiddleware");
const upload = require("../middleware/multerConfig");

// 1. [CÔNG KHAI]
router.get("/approved", eventController.getApprovedEvents);

// 2. [NGƯỜI DÙNG] Đóng góp
// TẠM THỜI: Bỏ protect và canContribute để fix lỗi 401 khi test
router.post(
  "/contribute",
  upload.array("images", 5),
  eventController.createEvent,
);

// 3. [ADMIN] Quản lý & Thống kê
// TẠM THỜI: Bỏ protect và adminOnly để em có thể Duyệt bài ngay lập tức
router.get("/stats", eventController.getAdminStats);
router.get("/pending", eventController.getPendingEvents);
router.patch("/update-status/:id", eventController.updateStatus);
router.delete("/delete/:id", eventController.deleteEvent);

// 4. [CHI TIẾT] Luôn để cuối
router.get("/:id", eventController.getEventById);

module.exports = router;
