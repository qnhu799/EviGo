const Event = require("../models/Event");

// 1. Tạo sự kiện mới (Người dùng đóng góp)
exports.createEvent = async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res
      .status(201)
      .json({ message: "Gửi đóng góp thành công! Đang chờ duyệt." });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi gửi đóng góp" });
  }
};

// 2. Lấy danh sách sự kiện CHỜ DUYỆT (Cho Admin)
exports.getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "pending" });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Lỗi tải danh sách chờ" });
  }
};

// 3. Cập nhật trạng thái Duyệt hoặc Từ chối
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' hoặc 'rejected'
    await Event.findByIdAndUpdate(id, { status });
    res.json({ message: "Cập nhật trạng thái thành công!" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi cập nhật" });
  }
};

// 4. Lấy danh sách sự kiện ĐÃ DUYỆT (Hiện lên Bản đồ & Trang chủ)
exports.getApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "approved" });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Lỗi tải danh sách sự kiện đã duyệt" });
  }
};

// 5. Xóa sự kiện khỏi hệ thống
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    res.json({ message: "Xóa sự kiện thành công!" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi xóa sự kiện" });
  }
};

// 6. Lấy chi tiết DUYẾN NHẤT 1 sự kiện (Đổ dữ liệu vào trang EventDetail)
// Đây là chìa khóa để trang "Lễ hội ẩm thực" của Như hiện đúng thông tin thật
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sự kiện này rồi Như ơi!" });
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: "Lỗi tải chi tiết sự kiện" });
  }
};
