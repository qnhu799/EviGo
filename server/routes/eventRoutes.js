const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { protect, adminOnly } = require("../authMiddleware");
const upload = require("../middleware/multerConfig");

router.get("/approved", eventController.getApprovedEvents);

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

router.put("/profile-update", protect, eventController.updateProfile);

router.get("/saved-events-ids", protect, eventController.getSavedEventIds);

router.post("/save-event/:eventId", protect, eventController.toggleSaveEvent);

router.get(
  "/saved-events-details",
  protect,
  eventController.getSavedEventsDetails,
);

router.get("/my-saved-events", protect, eventController.getSavedEventsDetails);

router.get("/:id", eventController.getEventById);

module.exports = router;
