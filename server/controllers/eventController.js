const Event = require("../models/Event");

// 1. Tạo sự kiện mới (Đóng góp)
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
      contributor: {
        displayName: req.body.contributor || "Người dùng ẩn danh",
        name: req.user ? req.user.username : "",
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

// 2. Duyệt bài
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

    res.json({
      message: "Cập nhật trạng thái thành công!",
      data: updatedEvent,
    });
  } catch (err) {
    console.error("❌ Lỗi updateStatus:", err.message);
    res.status(500).json({ error: "Lỗi hệ thống khi duyệt" });
  }
};

// 3. Lấy danh sách sự kiện ĐÃ DUYỆT
exports.getApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "approved" })
      .sort({ updatedAt: -1 })
      .lean();
    res.json(events || []);
  } catch (err) {
    console.error("❌ Lỗi getApprovedEvents:", err.message);
    res.status(500).json({ error: "Lỗi tải danh sách" });
  }
};

// 4. Lấy danh sách sự kiện CHỜ DUYỆT
exports.getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .lean();
    res.json(events || []);
  } catch (err) {
    console.error("❌ Lỗi getPendingEvents:", err.message);
    res.status(500).json({ error: "Lỗi tải danh sách chờ" });
  }
};

// 5. Thống kê Admin (Dùng cho 3 thẻ màu)
exports.getAdminStats = async (req, res) => {
  try {
    const [approvedCount, rejectedCount, pendingCount] = await Promise.all([
      Event.countDocuments({ status: "approved" }),
      Event.countDocuments({ status: "rejected" }),
      Event.countDocuments({ status: "pending" }),
    ]);
    res.json({ approvedCount, rejectedCount, pendingCount });
  } catch (err) {
    console.error("❌ Lỗi getAdminStats:", err.message);
    res.status(500).json({ error: "Lỗi lấy thống kê" });
  }
};

// 6. Xóa sự kiện
exports.deleteEvent = async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy để xóa" });
    res.json({ message: "Xóa sự kiện thành công!" });
  } catch (err) {
    console.error("❌ Lỗi deleteEvent:", err.message);
    res.status(500).json({ error: "Lỗi khi xóa" });
  }
};

// 7. Chi tiết sự kiện
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).lean();
    if (!event) return res.status(404).json({ message: "Không tìm thấy!" });
    res.json(event);
  } catch (err) {
    console.error("❌ Lỗi getEventById:", err.message);
    res.status(500).json({ error: "Lỗi tải chi tiết" });
  }
};

// 8. HÀM FIX LỖI 500: Lấy tất cả sự kiện (Admin lọc)
exports.getAllEventsForAdmin = async (req, res) => {
  try {
    // .lean() cực kỳ quan trọng để Frontend nhận JSON thuần
    const events = await Event.find({}).sort({ createdAt: -1 }).lean();
    res.status(200).json(events || []);
  } catch (err) {
    console.error("‼️ LỖI NGHIÊM TRỌNG TẠI getAllEventsForAdmin:", err);
    res
      .status(500)
      .json({
        error: "Lỗi server khi tải dữ liệu cho Admin",
        details: err.message,
      });
  }
};
