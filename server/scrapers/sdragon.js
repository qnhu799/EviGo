const puppeteer = require("puppeteer");

async function scrapeSdragon() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  const results = [];
  const CURRENT_YEAR = new Date().getFullYear();

  try {
    console.log(`🔍 Bắt đầu quét bảng tổng hợp sự kiện trên Sdragon...`);
    const targetUrl =
      "https://sdragon.com.vn/events/lich-hoi-cho-trien-lam-viet-nam-nam-2026-cap-nhat-moi-nhat/";
    await page.goto(targetUrl, { waitUntil: "networkidle2" });

    // 1. LẤY TẤT CẢ LINK SỰ KIỆN TỪ BẢNG
    const eventLinks = await page.evaluate(() => {
      const links = [];
      const tables = document.querySelectorAll("table");
      tables.forEach((table) => {
        const rows = table.querySelectorAll("tr");
        rows.forEach((row) => {
          // Lấy cột đầu tiên (chứa tên sự kiện và link)
          const nameCell = row.querySelector("td");
          if (nameCell) {
            const aTag = nameCell.querySelector("a");
            if (aTag && aTag.href) {
              links.push(aTag.href);
            }
          }
        });
      });
      return links;
    });

    // Lọc trùng và giới hạn số lượng bài cào (để tránh bị chặn IP)
    const uniqueLinks = [...new Set(eventLinks)].slice(0, 50);
    console.log(
      `\n🚀 Tìm thấy ${uniqueLinks.length} link sự kiện chi tiết. Bắt đầu cào...`,
    );

    // 2. CHUI VÀO TỪNG LINK ĐỂ LẤY CHI TIẾT
    for (let link of uniqueLinks) {
      console.log(`   👉 Đang cào: ${link}`);
      await page.goto(link, { waitUntil: "networkidle2" });

      const eventData = await page.evaluate(() => {
        const ogImage = document.querySelector(
          'meta[property="og:image"]',
        )?.content;
        const featuredImg = document.querySelector(
          ".entry-content img, .post-content img, article img",
        )?.src;
        const image = ogImage || featuredImg || "";

        const title =
          document.querySelector("h1")?.innerText.trim() ||
          document.title.split("-")[0].trim();
        const bodyText = document.body.innerText;

        // Quét nội dung chi tiết
        const contentArea =
          document.querySelector(".entry-content, .post-content, article") ||
          document.body;
        let formattedText = [];
        let lastText = "";

        if (contentArea) {
          const elements = contentArea.querySelectorAll(
            "h2, h3, h4, p, li, strong",
          );
          elements.forEach((el) => {
            let text = el.innerText.trim();
            let tag = el.tagName.toLowerCase();

            // Bỏ qua quảng cáo của Sdragon
            if (
              text.length < 15 ||
              text === lastText ||
              text.includes("Hotline") ||
              text.includes("097 505 9989") ||
              text.includes("SDRAGON")
            )
              return;

            if (
              tag.match(/^h[2-4]$/) ||
              (text.match(/^[0-9]\.[0-9]/) && text.length < 80)
            ) {
              formattedText.push(`\n🔥 ${text.toUpperCase()} 🔥\n`);
            } else if (
              tag === "li" ||
              text.startsWith("-") ||
              text.startsWith("•")
            ) {
              formattedText.push(`  - ${text}`);
            } else if (tag === "strong" && text.endsWith("?")) {
              formattedText.push(`\n❓ ${text}\n`);
            } else {
              if (!lastText.includes(text) && !text.includes(lastText)) {
                formattedText.push(`${text}\n`);
              }
            }
            lastText = text;
          });
        }

        const description =
          formattedText.length > 0
            ? formattedText.join("\n")
            : "Đang cập nhật nội dung chi tiết...";

        // Trích xuất Địa điểm, Ngày bắt đầu, Ngày kết thúc cực chuẩn dựa trên format web
        let rawAddress = "";
        let rawStartDate = "";
        let rawEndDate = "";

        const lines = bodyText.split("\n");
        for (let line of lines) {
          if (line.toLowerCase().includes("địa điểm:"))
            rawAddress = line.replace(/địa điểm:/i, "").trim();
          if (line.toLowerCase().includes("ngày bắt đầu:"))
            rawStartDate = line.replace(/ngày bắt đầu:/i, "").trim();
          if (line.toLowerCase().includes("ngày kết thúc:"))
            rawEndDate = line.replace(/ngày kết thúc:/i, "").trim();
        }

        return {
          title,
          image,
          fullText: bodyText,
          description,
          rawAddress,
          rawStartDate,
          rawEndDate,
        };
      });

      if (eventData.title) {
        // --- XỬ LÝ NGÀY THÁNG ---
        let parsedStartDate = new Date();
        let parsedEndDate = new Date();

        if (eventData.rawStartDate) {
          const dateMatch = eventData.rawStartDate.match(
            /(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?/,
          );
          if (dateMatch) {
            const d = parseInt(dateMatch[1]);
            const m = parseInt(dateMatch[2]);
            const y = dateMatch[3] ? parseInt(dateMatch[3]) : CURRENT_YEAR;
            parsedStartDate = new Date(y, m - 1, d);
          }
        } else {
          // Cứu cánh nếu bài viết không có dòng "Ngày bắt đầu:" chuẩn
          const fallbackMatch = eventData.fullText.match(
            /(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?[\/\-](\d{1,2})(?:[\/\-](\d{4}))?/,
          );
          if (fallbackMatch) {
            const d1 = parseInt(fallbackMatch[1]);
            const m = parseInt(fallbackMatch[3]);
            const y = fallbackMatch[4]
              ? parseInt(fallbackMatch[4])
              : CURRENT_YEAR;
            parsedStartDate = new Date(y, m - 1, d1);
          }
        }

        if (eventData.rawEndDate) {
          const dateMatch = eventData.rawEndDate.match(
            /(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?/,
          );
          if (dateMatch) {
            const d = parseInt(dateMatch[1]);
            const m = parseInt(dateMatch[2]);
            const y = dateMatch[3] ? parseInt(dateMatch[3]) : CURRENT_YEAR;
            parsedEndDate = new Date(y, m - 1, d);
          }
        } else {
          parsedEndDate = parsedStartDate;
        }

        // --- XỬ LÝ ĐỊA ĐIỂM ---
        let addressStr =
          eventData.rawAddress || "Đang cập nhật (Xem trên web sự kiện)";
        let districtStr = "Chưa rõ";
        let lat = 10.776;
        let lng = 106.701;
        const textLower = eventData.fullText.toLowerCase();
        const addressLower = addressStr.toLowerCase();

        if (
          addressLower.includes("secc") ||
          textLower.includes("799 nguyễn văn linh")
        ) {
          addressStr =
            "Trung tâm Hội chợ và Triển lãm Sài Gòn (SECC), Quận 7, TP.HCM";
          districtStr = "Quận 7";
          lat = 10.7327;
          lng = 106.7218;
        } else if (
          addressLower.includes("phú thọ") ||
          textLower.includes("quận 11")
        ) {
          addressStr = "Nhà thi đấu Phú Thọ, Quận 11, TP.HCM";
          districtStr = "Quận 11";
          lat = 10.7705;
          lng = 106.6578;
        } else if (
          addressLower.includes("i.c.e") ||
          textLower.includes("trần hưng đạo")
        ) {
          addressStr =
            "Trung tâm Triển lãm Quốc tế I.C.E, Quận Hoàn Kiếm, Hà Nội";
          districtStr = "Hoàn Kiếm";
          lat = 21.0246;
          lng = 105.8427;
        } else if (
          addressLower.includes("quốc gia hà nội") ||
          textLower.includes("ncc")
        ) {
          addressStr = "Trung tâm Hội nghị Quốc gia (NCC), Nam Từ Liêm, Hà Nội";
          districtStr = "Nam Từ Liêm";
          lat = 21.0069;
          lng = 105.7876;
        } else {
          const districtMatch = addressStr.match(
            /(Quận|Huyện|Thị xã|Thành phố)\s+([A-Z0-9a-zÀ-ỹ\s]+)(?=,|-|$)/i,
          );
          if (districtMatch) districtStr = districtMatch[0].trim();
        }

        // --- PHÂN LOẠI THỂ LOẠI ĐỒNG BỘ VỚI GIAO DIỆN EVIGO ---
        let eventType = "Triển lãm";
        const combinedText = (
          eventData.title +
          " " +
          eventData.fullText
        ).toLowerCase();

        if (
          combinedText.includes("âm nhạc") ||
          combinedText.includes("concert")
        )
          eventType = "Âm nhạc";
        else if (
          combinedText.includes("thực phẩm") ||
          combinedText.includes("food") ||
          combinedText.includes("đồ uống")
        )
          eventType = "Ẩm thực";
        else if (
          combinedText.includes("thể thao") ||
          combinedText.includes("marathon")
        )
          eventType = "Thể thao";
        else if (
          combinedText.includes("hội thảo") ||
          combinedText.includes("giáo dục")
        )
          eventType = "Học thuật";

        results.push({
          title: eventData.title,
          description: eventData.description,
          image: eventData.image,
          images: eventData.image ? [eventData.image] : [],
          locations: [
            { address: addressStr, district: districtStr, lat: lat, lng: lng },
          ],
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          ticketPrice: "Vào cửa tự do",
          status: "approved",
          type: eventType,
        });
      }
    }
  } catch (e) {
    console.error("❌ Lỗi cào dữ liệu Sdragon:", e.message);
  } finally {
    await browser.close();
  }
  return results;
}

module.exports = scrapeSdragon;
