const puppeteer = require("puppeteer");

async function scrapeLehoi() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  const results = [];
  const CURRENT_YEAR = 2026;

  try {
    let allEventLinks = [];
    const maxPages = 1; // Chỉ cào trang đầu tiên

    // KHAI BÁO CÁC CHUYÊN MỤC CẦN CÀO
    const categories = [
      {
        name: "Trang chủ (Toàn quốc)",
        baseUrl: "https://lehoivietnam.com.vn/vi",
      },
      {
        name: "Chuyên mục TP.HCM",
        baseUrl:
          "https://lehoivietnam.com.vn/vi/dia-diem/thanh-pho-ho-chi-minh-l41437844471808",
      },
    ];

    console.log(
      `🔍 Bắt đầu quét link từ ${categories.length} chuyên mục, mỗi chuyên mục ${maxPages} trang...`,
    );

    // 1. VÒNG LẶP QUÉT QUA TỪNG CHUYÊN MỤC
    for (let category of categories) {
      console.log(`\n👉 Đang quét: ${category.name}`);

      for (let i = 1; i <= maxPages; i++) {
        const url =
          i === 1 ? category.baseUrl : `${category.baseUrl}/page/${i}/`;

        try {
          await page.goto(url, { waitUntil: "networkidle2" });
          const linksOnPage = await page.evaluate(() => {
            return Array.from(document.querySelectorAll("h3 a")).map(
              (a) => a.href,
            );
          });

          allEventLinks.push(...linksOnPage);
          console.log(
            `   ✅ Đã gom được ${linksOnPage.length} link từ Trang ${i}`,
          );
        } catch (err) {
          console.log(`   ⚠️ Bỏ qua trang ${i} do lỗi hoặc hết trang.`);
        }
      }
    }

    const uniqueEventLinks = [...new Set(allEventLinks)];
    console.log(
      `\n🚀 Tổng cộng tìm thấy ${uniqueEventLinks.length} sự kiện duy nhất. Bắt đầu cào chi tiết...`,
    );

    // 2. VÒNG LẶP CÀO CHI TIẾT
    for (let link of uniqueEventLinks) {
      await page.goto(link, { waitUntil: "networkidle2" });

      const eventData = await page.evaluate(() => {
        // --- ẢNH BÌA ---
        const ogImage = document.querySelector(
          'meta[property="og:image"]',
        )?.content;
        const fallbackImage =
          document.querySelector("img.attachment-large")?.src ||
          document.querySelector("img")?.src;
        const image = ogImage || fallbackImage || "";

        // --- GIỚI THIỆU ---
        const rawParagraphs = Array.from(
          document.querySelectorAll(
            "p, .elementor-text-editor, .elementor-text-editor li",
          ),
        )
          .map((el) => el.innerText.trim())
          .filter(
            (text) =>
              text.length > 50 &&
              !text.includes("THỜI GIAN") &&
              !text.includes("Khám phá"),
          );
        const uniqueParagraphs = [...new Set(rawParagraphs)];
        const description =
          uniqueParagraphs.length > 0
            ? uniqueParagraphs.join("\n\n")
            : "Đang cập nhật giới thiệu...";

        // --- THỜI GIAN & ĐỊA ĐIỂM ---
        const bodyText = document.body.innerText;
        const infoMatch = bodyText.match(
          /THỜI GIAN & ĐỊA ĐIỂM[\s\n]+([^\n]+)[\s\n]+([^\n]+)/i,
        );
        let timeText = infoMatch ? infoMatch[1].trim() : "";
        let addressText = infoMatch ? infoMatch[2].trim() : "Đang cập nhật";

        // --- GIÁ VÉ ---
        let ticketPriceText = "Chưa xác định";
        const priceMatch = bodyText.match(
          /(Giá vé|Vé vào cổng|Chi phí)[\s:]+([^\n]{1,60})/i,
        );
        if (priceMatch) {
          ticketPriceText = priceMatch[2].trim();
        } else if (bodyText.match(/miễn phí/i)) {
          ticketPriceText = "Miễn phí";
        } else if (bodyText.match(/vào cửa tự do/i)) {
          ticketPriceText = "Vào cửa tự do";
        }

        const title = document.querySelector("h1")?.innerText.trim();

        // --- THỂ LOẠI THÔNG MINH ---
        let eventType = "Lễ hội"; // Mặc định
        // Tìm danh mục từ các thẻ meta hoặc class phổ biến
        const metaSection = document.querySelector(
          'meta[property="article:section"]',
        );
        const catElement = document.querySelector(
          ".elementor-post-info__terms-list-item, .category-name, .post-category a, .entry-category a",
        );

        if (metaSection && metaSection.content) {
          eventType = metaSection.content.trim();
        } else if (catElement) {
          eventType = catElement.innerText.trim();
        } else if (title) {
          // Nếu không có thẻ tag, phân tích qua tiêu đề
          const titleLower = title.toLowerCase();
          if (
            titleLower.includes("âm nhạc") ||
            titleLower.includes("ca nhạc") ||
            titleLower.includes("liveshow")
          )
            eventType = "Âm nhạc";
          else if (
            titleLower.includes("triển lãm") ||
            titleLower.includes("hội chợ")
          )
            eventType = "Triển lãm";
          else if (
            titleLower.includes("văn hóa") ||
            titleLower.includes("nghệ thuật")
          )
            eventType = "Văn hóa & Nghệ thuật";
          else if (
            titleLower.includes("ẩm thực") ||
            titleLower.includes("món ngon")
          )
            eventType = "Ẩm thực";
          else if (
            titleLower.includes("thể thao") ||
            titleLower.includes("giải chạy") ||
            titleLower.includes("marathon")
          )
            eventType = "Thể thao";
        }

        return {
          title: title,
          image: image,
          timeText: timeText,
          addressText: addressText,
          description: description,
          ticketPrice: ticketPriceText,
          type: eventType, // Trả về thể loại đã phân tích
        };
      });

      if (eventData.title) {
        // --- Xử lý ngày tháng ---
        let parsedStartDate = new Date();
        let parsedEndDate = new Date();

        if (eventData.timeText) {
          const dateMatches = eventData.timeText.match(/\d{1,2}\/\d{1,2}/g);
          if (dateMatches && dateMatches.length >= 1) {
            const [day1, month1] = dateMatches[0].split("/");
            parsedStartDate = new Date(
              CURRENT_YEAR,
              parseInt(month1) - 1,
              parseInt(day1),
            );

            if (dateMatches.length >= 2) {
              const [day2, month2] = dateMatches[1].split("/");
              parsedEndDate = new Date(
                CURRENT_YEAR,
                parseInt(month2) - 1,
                parseInt(day2),
              );
            } else {
              parsedEndDate = parsedStartDate;
            }
          }
        }

        // --- Xử lý tọa độ ---
        let lat = 10.776,
          lng = 106.701;
        const addrLower = eventData.addressText.toLowerCase();
        if (addrLower.includes("hải phòng")) {
          lat = 20.8449;
          lng = 106.6881;
        } else if (addrLower.includes("đà nẵng")) {
          lat = 16.047;
          lng = 108.206;
        } else if (addrLower.includes("hà nội")) {
          lat = 21.0285;
          lng = 105.8542;
        }

        const cleanAddress = eventData.addressText.replace(/•/g, "-").trim();

        // Tách Phường/Quận và Địa chỉ
        let districtStr = "";
        let addressStr = cleanAddress;

        if (cleanAddress.includes("-")) {
          const parts = cleanAddress.split("-");
          districtStr = parts[0].trim();
          addressStr = cleanAddress;
        } else if (
          cleanAddress.toLowerCase().includes("phường") ||
          cleanAddress.toLowerCase().includes("quận") ||
          cleanAddress.toLowerCase().includes("huyện")
        ) {
          districtStr = cleanAddress;
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
              lat: lat,
              lng: lng,
            },
          ],
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          ticketPrice: eventData.ticketPrice,
          status: "approved",
          type: eventData.type, // Gán trực tiếp thể loại mà bot vừa tìm được
        });
      }
    }
  } catch (e) {
    console.error("❌ Lỗi cào dữ liệu Lễ hội:", e.message);
  } finally {
    await browser.close();
  }
  return results;
}

module.exports = scrapeLehoi;
