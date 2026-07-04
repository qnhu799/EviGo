require("dotenv").config();
const mongoose = require("mongoose");
const Event = require("../models/Event");

// Các module cào dữ liệu
const scrapeLehoi = require("../scrapers/lehoi");
const scrapeTrienLam = require("../scrapers/trienlam");
const scrapeTicketbox = require("../scrapers/ticketbox");
const scrapeVietnamVN = require("../scrapers/vietnam_vn");
const scrapeSdragon = require("../scrapers/sdragon"); // Đã nhúng vào đây

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
        { upsert: true },
      );
    }

    // 2. Chạy cào Triển lãm (TradePro)
    console.log("--- BẮT ĐẦU CÀO TRIỂN LÃM ---");
    const trienlamData = await scrapeTrienLam();
    for (const item of trienlamData) {
      await Event.findOneAndUpdate(
        { title: item.title },
        { $set: item },
        { upsert: true },
      );
    }

    // 3. Chạy cào Giải trí (Ticketbox)
    console.log("--- BẮT ĐẦU CÀO TICKETBOX ---");
    const ticketboxData = await scrapeTicketbox();
    for (const item of ticketboxData) {
      await Event.findOneAndUpdate(
        { title: item.title },
        { $set: item },
        { upsert: true },
      );
    }

    // 4. Chạy cào Sự kiện (Vietnam.vn)
    console.log("--- BẮT ĐẦU CÀO VIETNAM.VN ---");
    const vietnamvnData = await scrapeVietnamVN();
    for (const item of vietnamvnData) {
      await Event.findOneAndUpdate(
        { title: item.title },
        { $set: item },
        { upsert: true },
      );
    }

    // 5. Chạy cào Sự kiện Sdragon (Đã bổ sung)
    console.log("--- BẮT ĐẦU CÀO SDRAGON ---");
    const sdragonData = await scrapeSdragon();
    for (const item of sdragonData) {
      await Event.findOneAndUpdate(
        { title: item.title },
        { $set: item },
        { upsert: true },
      );
    }

    // Tổng kết
    console.log(
      `🎉 HOÀN TẤT! Đã cập nhật ${lehoiData.length} lễ hội, ${trienlamData.length} triển lãm, ${ticketboxData.length} sự kiện giải trí, ${vietnamvnData.length} sự kiện từ Vietnam.vn và ${sdragonData.length} sự kiện từ Sdragon vào Database.`,
    );
  } catch (err) {
    console.error("❌ Lỗi hệ thống:", err.message);
  } finally {
    process.exit();
  }
}

startCrawler();
