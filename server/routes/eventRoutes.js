const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { protect, adminOnly, canContribute } = require("../authMiddleware");

// QUAN TRỌNG: Đảm bảo em đã tạo file này trong thư mục middleware nhé
const upload = require("../middleware/multerConfig");

// 1. Lấy danh sách sự kiện công khai
router.get("/approved", eventController.getApprovedEvents);

// 2. Route Đóng góp sự kiện (SỬA DÒNG NÀY)
// Thêm upload.array("images", 5) để Multer bóc tách title, description và album ảnh
router.post(
  "/contribute",
  upload.array("images", 5),
  eventController.createEvent,
);

// 3. Quản lý dành cho Admin
router.get("/pending", eventController.getPendingEvents);
router.patch("/update-status/:id", eventController.updateStatus);
router.delete("/delete/:id", eventController.deleteEvent);

// 4. Lấy chi tiết một sự kiện
router.get("/:id", eventController.getEventById);

module.exports = router;
