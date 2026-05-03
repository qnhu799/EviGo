const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // HÀM BỔ SUNG: Xử lý chuỗi tiếng Việt thành chuỗi không dấu, an toàn cho Folder
    const slugify = (str) => {
      if (!str) return "unknown-event";
      return str
        .normalize("NFD") // Tách dấu ra khỏi chữ cái
        .replace(/[\u0300-\u036f]/g, "") // Xóa các dấu vừa tách
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D") // Sửa chữ đ đặc biệt
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "") // Chỉ giữ lại chữ, số và dấu gạch ngang
        .replace(/\s+/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
        .replace(/-+/g, "-"); // Tránh lặp dấu gạch ngang
    };

    // Lấy title từ body (đã được Frontend gửi lên trước file)
    const folderName = slugify(req.body.title);
    const dir = `uploads/${folderName}`;

    // Tự động tạo thư mục nếu chưa có
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Giữ nguyên cách đặt tên theo timestamp của Như
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
module.exports = upload;
