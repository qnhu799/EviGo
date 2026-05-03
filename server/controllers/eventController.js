const Event = require("../models/Event");

// 1. Tạo sự kiện mới (Người dùng đóng góp) - CHỈ CHỈNH SỬA PHẦN NÀY
exports.createEvent = async (req, res) => {
  try {
    // Tạo một bản sao dữ liệu từ body
    const eventData = { ...req.body };

    // GIẢI MÃ DỮ LIỆU: FormData biến Array thành String, mình phải parse lại
    if (eventData.locations && typeof eventData.locations === "string") {
      eventData.locations = JSON.parse(eventData.locations);
    }
    if (eventData.closedDays && typeof eventData.closedDays === "string") {
      eventData.closedDays = JSON.parse(eventData.closedDays);
    }

    // XỬ LÝ ALBUM ẢNH: Nếu Như có dùng Multer để nhận nhiều file
    if (req.files && req.files.length > 0) {
      // Lưu mảng đường dẫn ảnh vào trường images
      eventData.images = req.files.map((file) => file.path);
      // Gán ảnh đầu tiên làm ảnh đại diện chính (image) để khớp giao diện cũ
      eventData.image = req.files[0].path;
    }

    const newEvent = new Event(eventData);
    await newEvent.save();

    res
      .status(201)
      .json({ message: "Gửi đóng góp thành công! Đang chờ duyệt ✨" });
  } catch (err) {
    console.error("Lỗi Backend tại Controller:", err); // Để Như soi lỗi ở Terminal nè
    res
      .status(500)
      .json({ error: "Lỗi hệ thống khi xử lý mảng dữ liệu Như ơi!" });
  }
};

// --- CÁC HÀM CÒN LẠI GIỮ NGUYÊN ---
exports.getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "pending" });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Lỗi tải danh sách chờ" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await Event.findByIdAndUpdate(id, { status });
    res.json({ message: "Cập nhật trạng thái thành công!" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi cập nhật" });
  }
};

exports.getApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "approved" });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Lỗi tải danh sách sự kiện đã duyệt" });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    res.json({ message: "Xóa sự kiện thành công!" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi xóa sự kiện" });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event)
      return res.status(404).json({ message: "Không tìm thấy sự kiện!" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: "Lỗi tải chi tiết sự kiện" });
  }
};
