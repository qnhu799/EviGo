const puppeteer = require("puppeteer");

async function scrapeTicketbox() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  const results = [];
  const CURRENT_YEAR = new Date().getFullYear();

  try {
    console.log(`🔍 Bắt đầu đột nhập Ticketbox.vn...`);

    // 1. VÀO TRANG CHỦ & CUỘN TRANG ĐỂ LOAD DỮ LIỆU ĐỘNG
    await page.goto("https://ticketbox.vn/", { waitUntil: "networkidle2" });

    console.log(`   ⏳ Đang giả lập người dùng cuộn trang để tải sự kiện...`);
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        let distance = 150;
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

    // 2. GOM LINK SỰ KIỆN CHUẨN XÁC
    const allEventLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("a"))
        .map((a) => a.href)
        .filter(
          (href) =>
            href.includes("ticketbox.vn/events/") ||
            href.match(/ticketbox\.vn\/[a-z0-9-]+-\d{4,}/),
        )
        .filter(
          (href) =>
            !href.includes("faq") &&
            !href.includes("contact") &&
            !href.includes("about"),
        );
    });

    // Lọc trùng và CHỈ LẤY 10 BÀI
    const uniqueLinks = [...new Set(allEventLinks)].slice(0, 30);
    console.log(
      `\n🚀 Gom được ${uniqueLinks.length} sự kiện hot. Bắt đầu cào chi tiết...`,
    );

    // 3. CÀO CHI TIẾT TỪNG SỰ KIỆN
    for (let link of uniqueLinks) {
      console.log(`   👉 Đang cào: ${link}`);
      await page.goto(link, { waitUntil: "networkidle2" });

      await new Promise((r) => setTimeout(r, 1500));

      const eventData = await page.evaluate(() => {
        const ogImage = document.querySelector(
          'meta[property="og:image"]',
        )?.content;
        const fallbackImage = document.querySelector(
          ".event-poster img, .poster img",
        )?.src;
        const image = ogImage || fallbackImage || "";

        const title =
          document.querySelector("h1")?.innerText.trim() ||
          document.querySelector('meta[property="og:title"]')?.content ||
          "";

        const contentArea =
          document.querySelector(
            ".event-description, .event-details, .about-event",
          ) || document.body;
        let description = "Đang cập nhật nội dung sự kiện...";
        if (contentArea) {
          const paragraphs = Array.from(
            contentArea.querySelectorAll("p, li, .content-block div"),
          )
            .map((el) => el.innerText.trim())
            .filter((text) => text.length > 20 && !text.includes("Ticketbox"));
          if (paragraphs.length > 0) {
            description = [...new Set(paragraphs)].join("\n\n");
          }
        }

        return {
          title: title,
          image: image,
          fullText: document.body.innerText,
          description: description,
        };
      });

      if (eventData.title) {
        // --- XỬ LÝ NGÀY THÁNG ---
        let parsedStartDate = new Date();
        let parsedEndDate = new Date();
        const dateMatches = eventData.fullText.match(
          /\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?/g,
        );

        if (dateMatches && dateMatches.length >= 1) {
          const parts = dateMatches[0].replace("-", "/").split("/");
          parsedStartDate = new Date(
            parts[2] || CURRENT_YEAR,
            parseInt(parts[1]) - 1,
            parseInt(parts[0]),
          );
          parsedEndDate = parsedStartDate;
        }

        // --- TỪ ĐIỂN ĐỊA ĐIỂM ---
        let addressStr = "Đang cập nhật";
        let districtStr = "Chưa rõ";
        let lat = 10.776;
        let lng = 106.701;
        const textLower = eventData.fullText.toLowerCase();

        if (textLower.includes("nhà hát hòa bình")) {
          addressStr = "Nhà hát Hòa Bình, 240 Đường 3 Tháng 2, Quận 10, TP.HCM";
          districtStr = "Quận 10";
          lat = 10.7733;
          lng = 106.6749;
        } else if (
          textLower.includes("quân khu 7") ||
          textLower.includes("qk7")
        ) {
          addressStr =
            "Nhà thi đấu Quân Khu 7, 202 Hoàng Văn Thụ, Phú Nhuận, TP.HCM";
          districtStr = "Phú Nhuận";
          lat = 10.7981;
          lng = 106.6669;
        } else if (textLower.includes("gem center")) {
          addressStr = "GEM Center, 8 Nguyễn Bỉnh Khiêm, Quận 1, TP.HCM";
          districtStr = "Quận 1";
          lat = 10.7885;
          lng = 106.7001;
        } else if (
          textLower.includes("secc") ||
          textLower.includes("nguyễn văn linh")
        ) {
          addressStr = "SECC, 799 Nguyễn Văn Linh, Quận 7, TP.HCM";
          districtStr = "Quận 7";
          lat = 10.7327;
          lng = 106.7218;
        } else if (textLower.includes("trống đồng")) {
          addressStr =
            "Sân khấu Trống Đồng, 12B Cách Mạng Tháng 8, Quận 1, TP.HCM";
          districtStr = "Quận 1";
          lat = 10.7725;
          lng = 106.6917;
        } else if (textLower.includes("quần ngựa")) {
          addressStr = "Cung Thể thao Quần Ngựa, Văn Cao, Ba Đình, Hà Nội";
          districtStr = "Ba Đình";
          lat = 21.0396;
          lng = 105.8143;
        } else {
          const addressMatch = eventData.fullText.match(
            /(?:Địa điểm|Tại|Venue)[\s:]+([^\n]+)/i,
          );
          if (addressMatch) {
            addressStr = addressMatch[1].trim();
          }
        }

        // --- XỬ LÝ GIÁ VÉ ---
        let ticketPriceText = "Đang cập nhật";
        const priceMatch = eventData.fullText.match(
          /(Từ\s+)?\d{2,3}[.,]\d{3}(?:[.,]\d{3})?\s*(VND|VNĐ|đ)/i,
        );
        if (priceMatch) {
          ticketPriceText = priceMatch[0].trim();
        } else if (
          eventData.fullText.toLowerCase().includes("miễn phí") ||
          eventData.fullText.toLowerCase().includes("free ticket")
        ) {
          ticketPriceText = "Miễn phí";
        }

        // --- PHÂN LOẠI THỂ LOẠI ĐỒNG BỘ VỚI GIAO DIỆN EVIGO ---
        let eventType = "Giải trí"; // Mặc định nếu không khớp nhóm nào
        const titleLower = eventData.title.toLowerCase();
        const descLower = eventData.fullText.toLowerCase();
        const combinedText = titleLower + " " + descLower;

        // Nhóm 1: Âm nhạc
        if (
          combinedText.includes("liveshow") ||
          combinedText.includes("concert") ||
          combinedText.includes("đêm nhạc") ||
          combinedText.includes("âm nhạc") ||
          combinedText.includes("ca sĩ") ||
          combinedText.includes("show diễn")
        ) {
          eventType = "Âm nhạc";
        }
        // Nhóm 2: Học thuật
        else if (
          combinedText.includes("workshop") ||
          combinedText.includes("hội thảo") ||
          combinedText.includes("khóa học") ||
          combinedText.includes("talkshow") ||
          combinedText.includes("chia sẻ") ||
          combinedText.includes("giáo dục") ||
          combinedText.includes("học thuật")
        ) {
          eventType = "Học thuật";
        }
        // Nhóm 3: Thể thao
        else if (
          combinedText.includes("thể thao") ||
          combinedText.includes("chạy bộ") ||
          combinedText.includes("marathon") ||
          combinedText.includes("giải đấu") ||
          combinedText.includes("bóng đá")
        ) {
          eventType = "Thể thao";
        }
        // Nhóm 4: Triển lãm
        else if (
          combinedText.includes("triển lãm") ||
          combinedText.includes("exhibition") ||
          combinedText.includes("bảo tàng") ||
          combinedText.includes("trưng bày")
        ) {
          eventType = "Triển lãm";
        }
        // Nhóm 5: Ẩm thực
        else if (
          combinedText.includes("ẩm thực") ||
          combinedText.includes("món ngon") ||
          combinedText.includes("food") ||
          combinedText.includes("ăn uống") ||
          combinedText.includes("lễ hội bia")
        ) {
          eventType = "Ẩm thực";
        }
        // Nhóm "Hoặc khác" để không sót dữ liệu
        else if (
          combinedText.includes("hài kịch") ||
          combinedText.includes("kịch nói") ||
          combinedText.includes("cải lương") ||
          combinedText.includes("kịch")
        ) {
          eventType = "Sân khấu";
        } else if (
          combinedText.includes("lễ hội") ||
          combinedText.includes("festival")
        ) {
          eventType = "Lễ hội";
        }

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
          ticketPrice: ticketPriceText,
          status: "approved",
          type: eventType,
        });
      }
    }
  } catch (e) {
    console.error("❌ Lỗi cào dữ liệu Ticketbox:", e.message);
  } finally {
    await browser.close();
  }
  return results;
}

module.exports = scrapeTicketbox;
