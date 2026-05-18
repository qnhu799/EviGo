const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { protect } = require("../authMiddleware");
const Event = require("../models/Event") || mongoose.model("Event");

const commentSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userStringName: {
    type: String,
    default: "Người dùng EviGo",
  },
  content: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
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

    const updatedEvent = await Event.findByIdAndUpdate(
      cleanEventId,
      {
        averageRating: averageRating,
        totalReviews: totalReviews,
      },
      { new: true },
    );

    console.log(
      `✨ [EviGo Đã Cập Nhật DB OK] Sự kiện: ${eventId} -> Số sao TB: ${averageRating} (${totalReviews} đánh giá tổng hợp)`,
    );

    return updatedEvent;
  } catch (err) {
    console.error("❌ Lỗi tự động tính số sao trung bình:", err.message);
    return null;
  }
};

router.get("/event/:eventId", async (req, res) => {
  try {
    const cleanEventId = new mongoose.Types.ObjectId(req.params.eventId);

    const list = await Comment.find({ event: cleanEventId })
      .populate("user", "name email displayName username")
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error("Lỗi GET comments:", err.message);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ không thể lấy danh sách đánh giá!" });
  }
});

router.post("/add", protect, async (req, res) => {
  try {
    const { eventId, content, rating } = req.body;

    if (!content || !content.trim()) {
      return res
        .status(400)
        .json({ message: "Nội dung bình luận không được để trống!" });
    }

    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Không tìm thấy thông tin tài khoản hợp lệ!" });
    }

    let usernameFromToken =
      req.user?.username || req.user?.name || req.user?.displayName;

    if (!usernameFromToken || usernameFromToken === "Người dùng EviGo") {
      const userEmail = req.user?.email || "";
      if (userEmail && userEmail.includes("@")) {
        usernameFromToken = userEmail.split("@")[0]; "test"
      } else {
        usernameFromToken = "Người dùng EviGo";
      }
    }

    let comment = new Comment({
      event: new mongoose.Types.ObjectId(eventId),
      user: userId,
      userStringName: usernameFromToken,
      content,
      rating: Number(rating) || 5,
    });

    await comment.save();

    const updatedEventData = await updateEventRating(eventId);

    comment = await comment.populate("user", "name email displayName username");

    res.status(201).json({
      message: "Đăng tải đánh giá thành công! ✨",
      comment,
      event: updatedEventData,
    });
  } catch (err) {
    console.error("Lỗi POST comment:", err.message);
    res
      .status(500)
      .json({ message: "Không thể lưu bình luận, thử lại sau Như nhé!" });
  }
});

module.exports = router;
