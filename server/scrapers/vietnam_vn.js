const puppeteer = require("puppeteer");

async function scrapeVietnamVN() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  const results = [];
  const CURRENT_YEAR = new Date().getFullYear();

  try {
    console.log(`🔍 Bắt đầu đột nhập Vietnam.vn...`);

    // 1. VÀO TRANG DANH SÁCH SỰ KIỆN
    await page.goto("https://www.vietnam.vn/events", {
      waitUntil: "networkidle2",
    });

    // Cuộn trang để tải thêm nội dung
    console.log(`   ⏳ Đang quét danh sách sự kiện...`);
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        let distance = 300;
        let timer = setInterval(() => {
          let scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight - 500) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });

    // 2. GOM LINK SỰ KIỆN
    const allEventLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("a"))
        .map((a) => a.href)
        .filter(
          (href) =>
            href.includes("vietnam.vn/events/") &&
            href !== "https://www.vietnam.vn/events" &&
            href !== "https://www.vietnam.vn/events/",
        );
    });

    const uniqueLinks = [...new Set(allEventLinks)].slice(0, 50);
    console.log(
      `\n🚀 Tìm thấy ${uniqueLinks.length} sự kiện chính thống. Bắt đầu lấy chi tiết...`,
    );

    // 3. CÀO CHI TIẾT TỪNG BÀI
    for (let link of uniqueLinks) {
      console.log(`   👉 Đang cào: ${link}`);
      await page.goto(link, { waitUntil: "networkidle2" });

      const eventData = await page.evaluate(() => {
        const ogImage = document.querySelector(
          'meta[property="og:image"]',
        )?.content;
        const fallbackImage = document.querySelector(
          ".td-post-content img, .entry-content img, article img",
        )?.src;
        const image = ogImage || fallbackImage || "";

        const title =
          document.querySelector("h1")?.innerText.trim() ||
          document.querySelector('meta[property="og:title"]')?.content ||
          "";
        const bodyText = document.body.innerText;

        const contentArea =
          document.querySelector(".td-post-content, .entry-content, article") ||
          document.body;
        let formattedText = [];
        let lastText = "";

        if (contentArea) {
          const elements = contentArea.querySelectorAll("h2, h3, h4, p, li");
          elements.forEach((el) => {
            let text = el.innerText.trim();
            if (
              text.length < 20 ||
              text === lastText ||
              text.includes("Trang chủ") ||
              text.includes("vietnam.vn")
            )
              return;

            if (el.tagName.toLowerCase().match(/^h[2-4]$/)) {
              formattedText.push(`\n🔥 ${text.toUpperCase()} 🔥\n`);
            } else if (
              el.tagName.toLowerCase() === "li" ||
              text.startsWith("-") ||
              text.startsWith("•")
            ) {
              formattedText.push(`  - ${text}`);
            } else {
              formattedText.push(`${text}\n`);
            }
            lastText = text;
          });
        }

        const description =
          formattedText.length > 0
            ? formattedText.join("\n")
            : "Đang cập nhật nội dung sự kiện...";

        return {
          title: title,
          image: image,
          fullText: bodyText,
          description: description,
        };
      });

      if (eventData.title) {
        // --- TÁCH NGÀY THÁNG ---
        let parsedStartDate = new Date();
        let parsedEndDate = new Date();

        const dateRegex =
          /ngày\s+(\d{1,2})\s+tháng\s+(\d{1,2})(?:,\s+(\d{4}))?/gi;
        const matches = [...eventData.fullText.matchAll(dateRegex)];

        if (matches.length > 0) {
          const day1 = parseInt(matches[0][1]);
          const month1 = parseInt(matches[0][2]);
          const year1 = matches[0][3] ? parseInt(matches[0][3]) : CURRENT_YEAR;
          parsedStartDate = new Date(year1, month1 - 1, day1);
          parsedEndDate = parsedStartDate;

          if (matches.length > 1) {
            const day2 = parseInt(matches[1][1]);
            const month2 = parseInt(matches[1][2]);
            const year2 = matches[1][3]
              ? parseInt(matches[1][3])
              : CURRENT_YEAR;
            parsedEndDate = new Date(year2, month2 - 1, day2);
          }
        }

        // --- TÁCH ĐỊA ĐIỂM (Lấy đúng 100% nguyên văn) ---
        let addressStr = "Đang cập nhật";
        let districtStr = ""; // Để trống thay vì đoán mò

        // Lấy đúng phần địa điểm từ bài viết, ngắt đoạn nếu gặp các tiêu đề khác hoặc dấu xuống dòng
        const addressMatch = eventData.fullText.match(
          /Địa điểm\.?\s*(.*?)(?=\n|Nội dung sự kiện|Thời gian dự kiến|Những sự kiện khác)/i,
        );

        if (addressMatch && addressMatch[1]) {
          addressStr = addressMatch[1].trim();
        } else {
          const lineMatch = eventData.fullText.match(
            /(?:Tại|Địa điểm)[\s:]+([^\n]+)/i,
          );
          if (lineMatch) addressStr = lineMatch[1].trim();
        }

        // Nếu chuỗi địa chỉ lấy được quá dài (bốc nhầm đoạn văn), cắt ngắn lại
        if (addressStr.length > 150) {
          addressStr = addressStr.substring(0, 150) + "...";
        }

        // Tự động rút trích Quận/Huyện từ chính chuỗi địa chỉ vừa lấy (nếu có)
        const districtMatch = addressStr.match(
          /(Quận|Huyện|Thị xã|Thành phố)\s+([A-Z0-9a-zÀ-ỹ\s]+)(?=,|-|$)/i,
        );
        if (districtMatch) {
          districtStr = districtMatch[0].trim();
        }

        // --- PHÂN LOẠI THỂ LOẠI ---
        let eventType = "Tổng hợp";
        const titleLower = eventData.title.toLowerCase();
        const descLower = eventData.fullText.toLowerCase();
        const combinedText = titleLower + " " + descLower;

        if (
          combinedText.includes("liveshow") ||
          combinedText.includes("concert") ||
          combinedText.includes("đêm nhạc") ||
          combinedText.includes("âm nhạc") ||
          combinedText.includes("ca khúc") ||
          combinedText.includes("hòa nhạc")
        ) {
          eventType = "Âm nhạc";
        } else if (
          combinedText.includes("workshop") ||
          combinedText.includes("hội thảo") ||
          combinedText.includes("tọa đàm") ||
          combinedText.includes("diễn đàn") ||
          combinedText.includes("khoa học") ||
          combinedText.includes("giáo dục") ||
          combinedText.includes("học thuật") ||
          combinedText.includes("hội nghị")
        ) {
          eventType = "Học thuật";
        } else if (
          combinedText.includes("thể thao") ||
          combinedText.includes("chạy bộ") ||
          combinedText.includes("marathon") ||
          combinedText.includes("giải đấu") ||
          combinedText.includes("bóng đá") ||
          combinedText.includes("khai mạc đại hội")
        ) {
          eventType = "Thể thao";
        } else if (
          combinedText.includes("triển lãm") ||
          combinedText.includes("exhibition") ||
          combinedText.includes("bảo tàng") ||
          combinedText.includes("trưng bày") ||
          combinedText.includes("hội chợ")
        ) {
          eventType = "Triển lãm";
        } else if (
          combinedText.includes("ẩm thực") ||
          combinedText.includes("món ngon") ||
          combinedText.includes("food") ||
          combinedText.includes("đặc sản") ||
          combinedText.includes("lễ hội bánh") ||
          combinedText.includes("nông sản")
        ) {
          eventType = "Ẩm thực";
        } else if (
          combinedText.includes("nghệ thuật") ||
          combinedText.includes("múa") ||
          combinedText.includes("sân khấu") ||
          combinedText.includes("kịch")
        ) {
          eventType = "Sân khấu";
        } else if (
          combinedText.includes("lễ hội") ||
          combinedText.includes("festival") ||
          combinedText.includes("tuần lễ văn hóa")
        ) {
          eventType = "Lễ hội";
        }

        results.push({
          title: eventData.title,
          description: eventData.description,
          image: eventData.image,
          images: eventData.image ? [eventData.image] : [],
          locations: [
            {
              address: addressStr,
              district: districtStr,
              lat: 16.0544,
              lng: 108.2022,
            },
          ],
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          ticketPrice: "Cập nhật trên website",
          status: "approved",
          type: eventType,
        });
      }
    }
  } catch (e) {
    console.error("❌ Lỗi cào dữ liệu Vietnam.vn:", e.message);
  } finally {
    await browser.close();
  }
  return results;
}

module.exports = scrapeVietnamVN;
