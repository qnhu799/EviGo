const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { protect, adminOnly } = require("../authMiddleware");
const upload = require("../middleware/multerConfig");

// 1. [CÔNG KHAI] - Không cần đăng nhập
router.get("/approved", eventController.getApprovedEvents);

// 2. [ADMIN/SUPERADMIN] - Quản lý & Phê duyệt
router.get("/stats", protect, adminOnly, eventController.getAdminStats);
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

// 3. [NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP] - Quản lý cá nhân
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

// 4. [CHI TIẾT] - Luôn để dưới cùng
router.get("/:id", eventController.getEventById);

module.exports = router;
