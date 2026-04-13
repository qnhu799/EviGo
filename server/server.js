const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/events", eventRoutes);
app.get("/", (req, res) => {
  res.send("EviGo Server is running...");
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ EviGo Database Connected!"))
  .catch((err) => console.log("❌ Lỗi kết nối nè Như ơi:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại port ${PORT}`);
});
