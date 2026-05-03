const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { protect, adminOnly, canContribute } = require("../authMiddleware");

router.get("/approved", eventController.getApprovedEvents);
router.post("/contribute", eventController.createEvent);
router.get("/pending", eventController.getPendingEvents);
router.patch("/update-status/:id", eventController.updateStatus);
router.delete("/delete/:id", eventController.deleteEvent);
router.get("/:id", eventController.getEventById);

module.exports = router;
