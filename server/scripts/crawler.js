require("dotenv").config();
const mongoose = require("mongoose");
const Event = require("../models/Event");
const scrapeLehoi = require("../scrapers/lehoi");
const scrapeTrienLam = require("../scrapers/trienlam"); // Nhúng thêm nguồn mới

async function startCrawler() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Kết nối DB thành công...");

    // 1. Chạy cào Lễ Hội
    console.log("--- BẮT ĐẦU CÀO LỄ HỘI ---");
    const lehoiData = await scrapeLehoi();
    for (const item of lehoiData) {
      await Event.findOneAndUpdate(
        { title: item.title },
        { $set: item },
        { upsert: true, runValidators: false },
      );
    }

    // 2. Chạy cào Triển lãm (TradePro)
    console.log("--- BẮT ĐẦU CÀO TRIỂN LÃM ---");
    const trienlamData = await scrapeTrienLam();
    for (const item of trienlamData) {
      await Event.findOneAndUpdate(
        { title: item.title },
        { $set: item },
        { upsert: true, runValidators: false },
      );
    }

    console.log(
      `🎉 HOÀN TẤT! Đã cập nhật ${lehoiData.length} lễ hội và ${trienlamData.length} triển lãm vào Database.`,
    );
  } catch (err) {
    console.error("❌ Lỗi hệ thống:", err.message);
  } finally {
    process.exit();
  }
}

startCrawler();
