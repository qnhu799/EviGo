const Event = require("../models/Event");

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
    const { status } = req.body; // 'approved' hoặc 'rejected'
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