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
// 2. [NGƯỜI DÙNG] - Quản lý đóng góp cá nhân
// ---------------------------------------------------------

// 🎯 QUAN TRỌNG: Lấy danh sách đóng góp của riêng tài khoản đang đăng nhập
// Phải có middleware 'protect' để lấy được req.user.id
router.get(
  "/my-contributions",
  protect,
  eventController.getMyContributedEvents,
);

// Gửi đóng góp sự kiện mới
// Lưu ý: Khi nào test xong, Như nên bật lại 'protect' để bảo mật nhé
router.post(
  "/contribute",
  upload.array("images", 5),
  eventController.createEvent,
);

// ---------------------------------------------------------
// 3. [ADMIN] - Quản lý, Thống kê & Phê duyệt
// ---------------------------------------------------------
router.get("/stats", eventController.getAdminStats);
router.get("/pending", eventController.getPendingEvents);
router.get("/all-for-admin", eventController.getAllEventsForAdmin);
router.patch("/update-status/:id", eventController.updateStatus);
router.delete("/delete/:id", eventController.deleteEvent);

// ---------------------------------------------------------
// 4. [CHI TIẾT] - Lấy thông tin 1 sự kiện cụ thể
// ---------------------------------------------------------
// LUÔN ĐỂ CUỐI CÙNG để không bị tranh chấp với các route GET khác
router.get("/:id", eventController.getEventById);

module.exports = router;
