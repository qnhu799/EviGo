const Event = require("../models/Event");

// 1. Gửi đóng góp sự kiện mới
exports.createEvent = async (req, res) => {
  try {
    const rawLocs = req.body.locations ? JSON.parse(req.body.locations) : [];
    const locations = rawLocs.map((loc) => ({
      address: loc.address || "",
      district: loc.district || "",
      lat: Number(loc.lat) || 0,
      lng: Number(loc.lng) || 0,
    }));

    const imagePaths = req.files
      ? req.files.map((f) => f.path.replace(/\\/g, "/"))
      : [];

    const eventData = {
      ...req.body,
      locations,
      images: imagePaths,
      image: imagePaths.length > 0 ? imagePaths[0] : "",
      isPermanent: String(req.body.isPermanent) === "true",
      isAllDay: String(req.body.isAllDay) === "true",
      closedDays: req.body.closedDays ? JSON.parse(req.body.closedDays) : [],
      contributor: req.user ? req.user.id : null,
      contributorInfo: {
        displayName: req.body.contributorName || "Người dùng ẩn danh",
        contact: req.body.contributorContact || "",
      },
      status: "pending",
    };

    if (req.body.startDate && req.body.startDate !== "")
      eventData.startDate = req.body.startDate;
    if (req.body.endDate && req.body.endDate !== "")
      eventData.endDate = req.body.endDate;

    const newEvent = new Event(eventData);
    await newEvent.save();
    res.status(201).json({ message: "Gửi đóng góp thành công!" });
  } catch (err) {
    console.error("❌ Lỗi createEvent:", err.message);
    res.status(500).json({ error: "Lỗi xử lý dữ liệu đóng góp" });
  }
};

// 2. Lấy danh sách đóng góp của riêng tôi (Trang cá nhân)
exports.getMyContributedEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const events = await Event.find({ contributor: userId })
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json(events || []);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách đóng góp của bạn" });
  }
};

// 3. Phê duyệt/Từ chối sự kiện (Lưu vết Admin xử lý)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user ? req.user.id : null;

    if (!status)
      return res.status(400).json({ error: "Thiếu trạng thái cập nhật!" });

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        status: status.toLowerCase(),
        approvedBy: adminId,
      },
      { new: true },
    );

    if (!updatedEvent)
      return res.status(404).json({ error: "Không tìm thấy sự kiện!" });

    res.status(200).json({
      message: "Cập nhật trạng thái thành công!",
      data: updatedEvent,
    });
  } catch (err) {
    res.status(500).json({ error: "Lỗi hệ thống khi duyệt" });
  }
};

// 4. Lấy danh sách cho Admin (Lọc Tím/Xanh/Đỏ Dashboard)
exports.getAdminEventsByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    const adminId = req.user.id;
    let query = { status: status };

    if (status === "approved" || status === "rejected") {
      query.approvedBy = adminId;
    }

    const events = await Event.find(query).sort({ updatedAt: -1 }).lean();
    res.status(200).json(events || []);
  } catch (err) {
    res.status(500).json({ error: "Lỗi tải danh sách quản trị" });
  }
};

// 5. Lấy TẤT CẢ sự kiện đã duyệt cho cộng đồng
exports.getApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "approved" })
      .sort({ updatedAt: -1 })
      .lean();
    res.status(200).json(events || []);
  } catch (err) {
    res.status(500).json({ error: "Lỗi tải danh sách công khai" });
  }
};

// 6. 🎯 BỔ SUNG: Lấy danh sách chờ duyệt (Routes của em đang gọi hàm này)
exports.getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json(events || []);
  } catch (err) {
    res.status(500).json({ error: "Lỗi tải danh sách chờ duyệt" });
  }
};

// 7. Thống kê năng suất cho Admin Dashboard
exports.getAdminStats = async (req, res) => {
  try {
    const adminId = req.user.id;
    const [approvedCount, rejectedCount, pendingCount] = await Promise.all([
      Event.countDocuments({ status: "approved", approvedBy: adminId }),
      Event.countDocuments({ status: "rejected", approvedBy: adminId }),
      Event.countDocuments({ status: "pending" }),
    ]);
    res.status(200).json({ approvedCount, rejectedCount, pendingCount });
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy thống kê" });
  }
};

// 8. Xóa sự kiện
exports.deleteEvent = async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy" });
    res.status(200).json({ message: "Xóa thành công!" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi xóa" });
  }
};

// 9. Lấy chi tiết sự kiện
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).lean();
    if (!event) return res.status(404).json({ message: "Không tìm thấy!" });
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: "Lỗi chi tiết" });
  }
};

// 10. Lấy tất cả (Cho SuperAdmin)
exports.getAllEventsForAdmin = async (req, res) => {
  try {
    const events = await Event.find({}).sort({ createdAt: -1 }).lean();
    res.status(200).json(events || []);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server" });
  }
};
