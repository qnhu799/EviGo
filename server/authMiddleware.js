const jwt = require("jsonwebtoken");
const protect = (req, res, next) => {
  let token = req.headers.authorization;
  if (token && token.startsWith("Bearer")) {
    try {
      const jwtSecret = process.env.JWT_SECRET || "EviGo_Secret_Key_997";
      const decoded = jwt.verify(token.split(" ")[1], jwtSecret);

      let finalizedId = null;
      let finalizedUsername = "";
      let finalizedEmail = "";

      if (decoded) {
        finalizedId =
          decoded.id ||
          decoded._id ||
          decoded.userId ||
          decoded.idUser ||
          decoded.uid;

        if (!finalizedId && decoded.user) {
          finalizedId =
            decoded.user.id || decoded.user._id || decoded.user.userId;
        }
        if (!finalizedId && decoded.data) {
          finalizedId =
            decoded.data.id || decoded.data._id || decoded.data.userId;
        }

        finalizedUsername =
          decoded.username ||
          decoded.name ||
          decoded.displayName ||
          (decoded.user
            ? decoded.user.username ||
              decoded.user.name ||
              decoded.user.displayName
            : "") ||
          (decoded.data ? decoded.data.username || decoded.data.name : "") ||
          "User EviGo";

        finalizedEmail =
          decoded.email ||
          decoded.mail ||
          (decoded.user ? decoded.user.email || decoded.user.mail : "") ||
          (decoded.data ? decoded.data.email : "") ||
          "";
      }

      req.user = {
        ...decoded,
        id: finalizedId ? finalizedId.toString() : null,
        _id: finalizedId ? finalizedId.toString() : null,
        role:
          decoded.role || (decoded.user ? decoded.user.role : "user") || "user",
        username: finalizedUsername.trim(),
        email: finalizedEmail.trim(), // Khóa chặt email sạch tìm được phục vụ lưới quét đối chiếu
      };

      next();
    } catch (error) {
      console.error("❌ Lỗi giải mã Token bảo mật:", error.message);
      res
        .status(401)
        .json({ message: "Phiên làm việc hết hạn hoặc token không hợp lệ!" });
    }
  } else {
    res.status(401).json({ message: "Vui lòng đăng nhập để tiếp tục!" });
  }
};

const adminOnly = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" || req.user.role === "superadmin")
  ) {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Chỉ Admin mới có quyền thực hiện hành động này!" });
  }
};

const canContribute = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "user" ||
      req.user.role === "admin" ||
      req.user.role === "superadmin" ||
      req.user.role === "organizer")
  ) {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Bạn cần nâng cấp tài khoản để đóng góp sự kiện!" });
  }
};

module.exports = { protect, adminOnly, canContribute };
