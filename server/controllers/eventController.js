const Event = require("../models/Event");

// 1. Tạo sự kiện mới (Giữ nguyên logic của Như)
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

// 2. Lấy danh sách đóng góp cá nhân (Giữ nguyên)
exports.getMyContributedEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const events = await Event.find({ contributor: userId })
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json(events || []);
  } catch (err) {
    console.error("❌ Lỗi getMyContributedEvents:", err.message);
    res.status(500).json({ error: "Lỗi khi lấy danh sách đóng góp của bạn" });
  }
};

// 🎯 3. DUYỆT BÀI: Đảm bảo lưu vết người thực hiện (approvedBy)
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
        approvedBy: adminId, // 🎯 Quan trọng: Gắn ID Admin để biết ai đã xử lý bài này
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

// 🎯 4. HÀM MỚI: Lấy danh sách cho Admin (Lọc theo sơ đồ của Như)
exports.getAdminEventsByStatus = async (req, res) => {
  try {
    const { status } = req.query; // pending, approved, hoặc rejected
    const adminId = req.user.id;

    let query = { status: status };

    // 🎯 Logic "Việc riêng": Nếu là Đã duyệt hoặc Đã hủy, chỉ lấy bài của chính Admin này
    if (status === "approved" || status === "rejected") {
      query.approvedBy = adminId;
    }
    // "Việc chung": Nếu là pending, query giữ nguyên để hiện tất cả cho mọi Admin thấy

    const events = await Event.find(query).sort({ updatedAt: -1 }).lean();
    res.status(200).json(events || []);
  } catch (err) {
    console.error("❌ Lỗi getAdminEventsByStatus:", err.message);
    res.status(500).json({ error: "Lỗi tải danh sách quản trị" });
  }
};

// 🎯 5. THỐNG KÊ ADMIN: Cập nhật để đếm đúng theo cá nhân hóa
exports.getAdminStats = async (req, res) => {
  try {
    const adminId = req.user.id;

    const [approvedCount, rejectedCount, pendingCount] = await Promise.all([
      // 🟢 Xanh: Chỉ đếm bài do chính mình duyệt
      Event.countDocuments({ status: "approved", approvedBy: adminId }),
      // 🔴 Đỏ: Chỉ đếm bài do chính mình hủy
      Event.countDocuments({ status: "rejected", approvedBy: adminId }),
      // 🟣 Tím: Hiện tổng số bài chờ (việc chung của cả đội Admin)
      Event.countDocuments({ status: "pending" }),
    ]);

    res.json({ approvedCount, rejectedCount, pendingCount });
  } catch (err) {
    console.error("❌ Lỗi getAdminStats:", err.message);
    res.status(500).json({ error: "Lỗi lấy thống kê" });
  }
};

// 6, 7, 8, 9... Các hàm xóa, lấy chi tiết, lấy tất cả (Giữ nguyên của Như)
exports.deleteEvent = async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy để xóa" });
    res.json({ message: "Xóa sự kiện thành công!" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi xóa" });
  }
};

exports.getApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "approved" })
      .sort({ updatedAt: -1 })
      .lean();
    res.json(events || []);
  } catch (err) {
    res.status(500).json({ error: "Lỗi tải danh sách" });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).lean();
    if (!event) return res.status(404).json({ message: "Không tìm thấy!" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: "Lỗi tải chi tiết" });
  }
};

exports.getAllEventsForAdmin = async (req, res) => {
  try {
    const events = await Event.find({}).sort({ createdAt: -1 }).lean();
    res.status(200).json(events || []);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi tải dữ liệu cho Admin" });
  }
};
