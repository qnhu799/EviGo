const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { protect } = require("../authMiddleware");
const Event = require("../models/Event") || mongoose.model("Event");

const commentSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userStringName: { type: String, default: "Người dùng EviGo" },
  content: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  createdAt: { type: Date, default: Date.now },
});

const Comment =
  mongoose.models.Comment || mongoose.model("Comment", commentSchema);

const updateEventRating = async (eventId) => {
  try {
    const cleanEventId = new mongoose.Types.ObjectId(eventId);
    const allComments = await Comment.find({ event: cleanEventId });
    const totalReviews = allComments.length;
    let averageRating = 5.0;
    if (totalReviews > 0) {
      const sum = allComments.reduce(
        (acc, cur) => acc + (Number(cur.rating) || 5),
        0,
      );
      averageRating = Math.round((sum / totalReviews) * 10) / 10;
    }
    return await Event.findByIdAndUpdate(
      cleanEventId,
      { averageRating, totalReviews },
      { new: true },
    );
  } catch (err) {
    console.error("Lỗi update rating:", err.message);
    return null;
  }
};

// 🎯 Route lấy comment
router.get("/event/:eventId", async (req, res) => {
  try {
    // Ép kiểu ID để tránh lỗi định dạng
    const cleanEventId = new mongoose.Types.ObjectId(req.params.eventId);
    const list = await Comment.find({ event: cleanEventId })
      .populate("user", "name email displayName username")
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error("Lỗi GET comments:", err.message);
    res.status(500).json({ message: "Lỗi lấy danh sách đánh giá!" });
  }
});

// 🎯 Route thêm comment
router.post("/add", protect, async (req, res) => {
  try {
    const { eventId, content, rating } = req.body;
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "ID sự kiện không hợp lệ!" });
    }

    let usernameFromToken =
      req.user?.username || req.user?.displayName || "Người dùng EviGo";

    let comment = new Comment({
      event: new mongoose.Types.ObjectId(eventId),
      user: req.user._id,
      userStringName: usernameFromToken,
      content,
      rating: Number(rating) || 5,
    });

    await comment.save();

    // Cập nhật rating sự kiện
    const updatedEvent = await updateEventRating(eventId);

    // Populate để Frontend có đủ thông tin user hiển thị ngay
    const populatedComment = await comment.populate(
      "user",
      "name email displayName username",
    );

    res.status(201).json({
      message: "Thành công",
      comment: populatedComment,
      event: updatedEvent,
    });
  } catch (err) {
    console.error("Lỗi POST comment:", err.message);
    res.status(500).json({ message: "Lỗi server khi lưu bình luận!" });
  }
});

module.exports = router;
