const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { protect, adminOnly } = require("../authMiddleware");
const upload = require("../middleware/multerConfig");

// 1. [CÔNG KHAI] - Không cần đăng nhập
router.get("/approved", eventController.getApprovedEvents);

// 2. [ADMIN/SUPERADMIN] - Quản lý & Phê duyệt
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

// =========================================================================
// 🎯 BOOKMARK SYSTEM (ĐÃ CẬP NHẬT ĐỒNG BỘ TÀI KHOẢN ĐỘC QUYỀN TRÁI TIM ĐỎ)
// =========================================================================

// Tuyển luồng 1: Lấy danh sách ID các sự kiện đã lưu của riêng tài khoản (Dùng để render trạng thái màu nút tim)
router.get("/saved-events-ids", protect, eventController.getSavedEventIds);

// Tuyển luồng 2: Xử lý Bấm Lưu / Hủy Lưu sự kiện (Mỗi tài khoản lưu vào mảng riêng biệt trong DB)
router.post("/save-event/:eventId", protect, eventController.toggleSaveEvent);

// Tuyển luồng 3: Lấy đầy đủ thông tin chi tiết các sự kiện đã lưu nộp cho trang Profile và trang Danh sách yêu thích
router.get(
  "/saved-events-details",
  protect,
  eventController.getSavedEventsDetails,
);

// 🎯 ĐƯỜNG TRUYỀN BẢO HIỂM: Trỏ song hành bảo vệ hệ thống phòng trường hợp Frontend gọi theo tên /my-saved-events
router.get("/my-saved-events", protect, eventController.getSavedEventsDetails);

// 4. [CHI TIẾT] - Luôn để dưới cùng
router.get("/:id", eventController.getEventById);

module.exports = router;
