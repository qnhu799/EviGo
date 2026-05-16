const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { protect, adminOnly } = require("../authMiddleware");
const upload = require("../middleware/multerConfig");

// 1. [CÔNG KHAI] - Không cần đăng nhập
router.get("/approved", eventController.getApprovedEvents);

// 2. [ADMIN/SUPERADMIN] - Quản lý & Phê duyệt (🎯 CẬP NHẬT: Cho phép bốc thêm userId parameter để đồng bộ trang Profile)
router.get("/stats", protect, eventController.getAdminStats);
router.get("/pending", protect, adminOnly, eventController.getPendingEvents);
router.get(
  "/admin-list",
  protect,
  adminOnly,
  eventController.getAdminEventsByStatus,
);
router.get(
  "/all-for-admin",
  protect,
  adminOnly,
  eventController.getAllEventsForAdmin,
);
router.patch(
  "/update-status/:id",
  protect,
  adminOnly,
  eventController.updateStatus,
);
router.delete("/delete/:id", protect, adminOnly, eventController.deleteEvent);

// 3. [NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP] - Quản lý cá nhân & Tiện ích
router.get(
  "/my-contributions",
  protect,
  eventController.getMyContributedEvents,
);
router.post(
  "/contribute",
  protect,
  upload.array("images", 5),
  eventController.createEvent,
);

// 🎯 TÍNH NĂNG MỚI: Định tuyến API xử lý hệ thống Lưu sự kiện yêu thích (Bookmark System)
router.get("/saved-events-ids", protect, eventController.getSavedEventIds);
router.post("/save-event/:eventId", protect, eventController.toggleSaveEvent);

// 🎯 ĐƯỜNG TRUYỀN MỚI: Lấy đầy đủ thông tin chi tiết các sự kiện đã lưu nộp cho trang Profile cá nhân
router.get(
  "/saved-events-details",
  protect,
  eventController.getSavedEventsDetails,
);

// 4. [CHI TIẾT] - Luôn để dưới cùng
router.get("/:id", eventController.getEventById);

module.exports = router;
