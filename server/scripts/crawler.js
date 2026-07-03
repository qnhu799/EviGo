require("dotenv").config();
const mongoose = require("mongoose");
const Event = require("../models/Event");
const scrapeLehoi = require("../scrapers/lehoi");

async function startCrawler() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Kết nối DB thành công...");

    const data = await scrapeLehoi();

    for (const item of data) {
      // Thay $setOnInsert thành $set để ÉP CẬP NHẬT thông tin mới đè lên bài cũ
      await Event.findOneAndUpdate(
        { title: item.title },
        { $set: item },
        { upsert: true, runValidators: false },
      );
    }
    console.log(
      `🎉 HOÀN TẤT! Đã cập nhật ${data.length} sự kiện vào Database.`,
    );
  } catch (err) {
    console.error("❌ Lỗi hệ thống:", err.message);
  } finally {
    process.exit();
  }
}

startCrawler();
