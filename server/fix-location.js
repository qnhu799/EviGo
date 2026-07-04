require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const Event = require("./models/Event");

// 1. TỪ ĐIỂN TỌA ĐỘ: Dành cho các địa điểm lớn mà API hay "bó tay"
const locationDictionary = {
  "Bình Dương Convention & Exhibition Center": { lat: 10.9996, lng: 106.6781 },
  BCEC: { lat: 10.9996, lng: 106.6781 },
  "Sky Expo Việt Nam": { lat: 10.8358, lng: 106.6795 },
  "Sky Expo": { lat: 10.8358, lng: 106.6795 },
  SECC: { lat: 10.7327, lng: 106.7218 },
  "Nhà hát Hòa Bình": { lat: 10.7766, lng: 106.6669 },
  "Cung Thể thao Quần Ngựa": { lat: 21.0396, lng: 105.8143 },
};

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

async function fixCoordinates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🚀 Bắt đầu quét và sửa tọa độ...");

    const events = await Event.find({});
    let successCount = 0;

    for (let event of events) {
      if (!event.locations || event.locations.length === 0) continue;

      let loc = event.locations[0];

      // Chỉ sửa các sự kiện đang bị gán tọa độ mặc định hoặc chưa có tọa độ
      if (
        !loc.lat ||
        loc.lat === 10.776 ||
        loc.lat === 16.0544 ||
        loc.lat === 10.7719
      ) {
        let foundManual = false;

        // A. Kiểm tra từ điển thủ công trước
        for (let key in locationDictionary) {
          if (loc.address.includes(key)) {
            event.locations[0].lat = locationDictionary[key].lat;
            event.locations[0].lng = locationDictionary[key].lng;
            await event.save();
            foundManual = true;
            console.log(
              `   ✨ [Từ điển] Đã gán tọa độ chuẩn cho: ${event.title}`,
            );
            successCount++;
            break;
          }
        }
        if (foundManual) continue;

        // B. Nếu không có trong từ điển, làm sạch địa chỉ rồi gọi API
        let cleanAddress = loc.address
          .replace(
            /(Tòa nhà|Tầng|Phòng|Tại|Địa điểm|Trung tâm|Nhà thi đấu|Sân khấu|Hội trường)[\s\w]*[:,]/gi,
            "",
          )
          .trim();

        console.log(`🔍 [API] Đang dò GPS cho: ${cleanAddress}`);

        try {
          const res = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json`,
            {
              params: {
                address: `${cleanAddress}, Việt Nam`,
                key: GOOGLE_API_KEY,
                language: "vi",
              },
            },
          );

          if (res.data.status === "OK" && res.data.results[0]) {
            const location = res.data.results[0].geometry.location;
            event.locations[0].lat = location.lat;
            event.locations[0].lng = location.lng;
            await event.save();
            console.log(
              `   ✅ [API] Đã cập nhật: ${location.lat}, ${location.lng}`,
            );
            successCount++;
          } else {
            console.log(`   ⚠️ [API] Bó tay với địa chỉ này.`);
          }
        } catch (e) {
          console.log(`   ❌ [API] Lỗi kết nối.`);
        }

        await new Promise((r) => setTimeout(r, 600)); // Nghỉ 0.6s để không bị chặn
      }
    }
    console.log(`\n🎉 HOÀN TẤT! Đã sửa thành công: ${successCount} sự kiện.`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

fixCoordinates();
