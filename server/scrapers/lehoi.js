const puppeteer = require("puppeteer");

async function scrapeLehoi() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  const results = [];
  const CURRENT_YEAR = 2026;

  try {
    await page.goto("https://lehoivietnam.com.vn/vi", {
      waitUntil: "networkidle2",
    });

    const eventLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("h3 a")).map((a) => a.href);
    });

    // Đã gỡ bỏ .slice(0, 5) để cào sạch toàn bộ danh sách sự kiện!
    for (let link of eventLinks) {
      await page.goto(link, { waitUntil: "networkidle2" });

      const eventData = await page.evaluate(() => {
        // 1. LẤY ẢNH BÌA
        const ogImage = document.querySelector(
          'meta[property="og:image"]',
        )?.content;
        const fallbackImage =
          document.querySelector("img.attachment-large")?.src ||
          document.querySelector("img")?.src;
        const image = ogImage || fallbackImage || "";

        // 2. LẤY GIỚI THIỆU SỰ KIỆN
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

        // 3. LẤY THỜI GIAN & ĐỊA ĐIỂM
        const bodyText = document.body.innerText;
        const infoMatch = bodyText.match(
          /THỜI GIAN & ĐỊA ĐIỂM[\s\n]+([^\n]+)[\s\n]+([^\n]+)/i,
        );

        let timeText = infoMatch ? infoMatch[1].trim() : "";
        let addressText = infoMatch ? infoMatch[2].trim() : "Đang cập nhật";

        // 4. LẤY GIÁ VÉ THÔNG MINH
        let ticketPriceText = "Chưa xác định";
        const priceMatch = bodyText.match(
          /(Giá vé|Vé vào cổng|Chi phí)[\s:]+([^\n]+)/i,
        );

        if (priceMatch) {
          ticketPriceText = priceMatch[2].trim();
        } else if (bodyText.match(/miễn phí/i)) {
          ticketPriceText = "Miễn phí";
        } else if (bodyText.match(/vào cửa tự do/i)) {
          ticketPriceText = "Vào cửa tự do";
        }

        return {
          title: document.querySelector("h1")?.innerText.trim(),
          image: image,
          timeText: timeText,
          addressText: addressText,
          description: description,
          ticketPrice: ticketPriceText, // Đổi tên biến cho khớp y chang Schema
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

        results.push({
          title: eventData.title,
          description: eventData.description,
          image: eventData.image,
          images: eventData.image ? [eventData.image] : [],
          locations: [
            {
              address: cleanAddress,
              lat: lat,
              lng: lng,
            },
          ],
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          ticketPrice: eventData.ticketPrice, // Nạp đúng tên trường ticketPrice
          status: "approved",
          type: "Lễ hội",
        });
      }
    }
  } catch (e) {
    console.error("Lỗi cào dữ liệu:", e.message);
  } finally {
    await browser.close();
  }
  return results;
}

module.exports = scrapeLehoi;
