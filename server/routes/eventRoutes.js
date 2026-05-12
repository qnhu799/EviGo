const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { protect, adminOnly, canContribute } = require("../authMiddleware");
const upload = require("../middleware/multerConfig");

// ---------------------------------------------------------
// 1. [CÔNG KHAI] - Cho khách xem trên trang chủ/bản đồ
// ---------------------------------------------------------
router.get("/approved", eventController.getApprovedEvents);

// ---------------------------------------------------------
// 2. [NGƯỜI DÙNG] - Gửi đóng góp sự kiện mới
// ---------------------------------------------------------
// TẠM THỜI: Bỏ protect/canContribute để Như test nhanh từ Frontend
router.post(
  "/contribute",
  upload.array("images", 5),
  eventController.createEvent,
);

// ---------------------------------------------------------
// 3. [ADMIN] - Quản lý, Thống kê & Phê duyệt
// ---------------------------------------------------------
// Lấy 3 con số thống kê cho thẻ màu (Tím, Xanh, Đỏ)
router.get("/stats", eventController.getAdminStats);

// Lấy danh sách chỉ những bài đang "Chờ duyệt"
router.get("/pending", eventController.getPendingEvents);

// 🎯 DÒNG QUAN TRỌNG: Lấy tất cả sự kiện để Admin lọc (Fix lỗi 500)
// Phải đặt TRÊN route "/:id" để không bị nhận nhầm
router.get("/all-for-admin", eventController.getAllEventsForAdmin);

// Cập nhật trạng thái (Duyệt/Hủy)
router.patch("/update-status/:id", eventController.updateStatus);

// Xóa sự kiện khỏi hệ thống
router.delete("/delete/:id", eventController.deleteEvent);

// ---------------------------------------------------------
// 4. [CHI TIẾT] - Lấy thông tin 1 sự kiện cụ thể
// ---------------------------------------------------------
// LUÔN ĐỂ CUỐI CÙNG vì ":id" là một biến động (dynamic param)
router.get("/:id", eventController.getEventById);

module.exports = router;
