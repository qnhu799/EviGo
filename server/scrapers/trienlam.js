const puppeteer = require("puppeteer");

async function scrapeTrienLam() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  const results = [];
  const CURRENT_YEAR = 2026;

  try {
    let allEventLinks = [];

    // KHAI BÁO CÁC CHUYÊN MỤC CẦN CÀO (Gồm TP.HCM và Hà Nội)
    const categories = [
      {
        name: "Triển lãm TP.HCM",
        url: "https://tradepro.vn/vi/hoi-cho-trien-lam/tp-ho-chi-minh",
      },
      {
        name: "Triển lãm Hà Nội",
        url: "https://tradepro.vn/vi/hoi-cho-trien-lam/ha-noi",
      },
    ];

    console.log(
      `🔍 Bắt đầu quét chuyên mục Triển lãm từ ${categories.length} khu vực...`,
    );

    // 1. GOM LINK TỪ CÁC CHUYÊN MỤC
    for (let category of categories) {
      console.log(`\n👉 Đang quét: ${category.name}`);
      await page.goto(category.url, { waitUntil: "networkidle2" });

      const linksOnPage = await page.evaluate(() => {
        return Array.from(
          document.querySelectorAll("h2 a, h3 a, .event-title a"),
        ).map((a) => a.href);
      });

      allEventLinks.push(...linksOnPage);
      console.log(
        `   ✅ Đã gom được ${linksOnPage.length} link từ ${category.name}`,
      );
    }

    const uniqueLinks = [...new Set(allEventLinks)];
    console.log(
      `\n🚀 Tổng cộng tìm thấy ${uniqueLinks.length} triển lãm. Bắt đầu cào chi tiết...`,
    );

    // 2. CÀO CHI TIẾT TỪNG BÀI
    for (let link of uniqueLinks) {
      await page.goto(link, { waitUntil: "networkidle2" });

      const eventData = await page.evaluate(() => {
        const ogImage = document.querySelector(
          'meta[property="og:image"]',
        )?.content;
        const fallbackImage = document.querySelector("img")?.src;
        const image = ogImage || fallbackImage || "";

        const bodyText = document.body.innerText;

        // BỘ GIẢI MÃ CẤU TRÚC TRANG TRADEPRO
        const contentElements = Array.from(
          document.querySelectorAll(
            ".entry-content h3, .entry-content h4, .entry-content p, .entry-content li, #content h3, #content p, #content li, .article-content h3, .article-content p, .article-content li",
          ),
        );

        let formattedText = contentElements
          .map((el) => {
            let text = el.innerText.trim();
            let tag = el.tagName.toLowerCase();

            if (text.length < 10) return "";

            if (tag === "h3" || tag === "h4") {
              return `\n🔥 ${text.toUpperCase()} 🔥`;
            }
            if (tag === "li") {
              return `- ${text}`;
            }
            return text;
          })
          .filter(
            (text) =>
              text !== "" &&
              !text.includes("Bản quyền") &&
              !text.includes("Trang chủ") &&
              !text.includes("Dịch vụ"),
          );

        const uniqueText = [...new Set(formattedText)];
        const description =
          uniqueText.length > 0
            ? uniqueText.join("\n")
            : "Đang cập nhật nội dung triển lãm...";

        return {
          title:
            document.querySelector("h1")?.innerText.trim() || document.title,
          image: image,
          fullText: bodyText,
          description: description,
        };
      });

      if (eventData.title) {
        // Tách ngày tháng
        let parsedStartDate = new Date();
        let parsedEndDate = new Date();
        const dateMatches = eventData.fullText.match(/\d{1,2}[\/\-]\d{1,2}/g);

        if (dateMatches && dateMatches.length >= 1) {
          const [day1, month1] = dateMatches[0].replace("-", "/").split("/");
          parsedStartDate = new Date(
            CURRENT_YEAR,
            parseInt(month1) - 1,
            parseInt(day1),
          );

          if (dateMatches.length >= 2) {
            const [day2, month2] = dateMatches[1].replace("-", "/").split("/");
            parsedEndDate = new Date(
              CURRENT_YEAR,
              parseInt(month2) - 1,
              parseInt(day2),
            );
          } else {
            parsedEndDate = parsedStartDate;
          }
        }

        // TỌA ĐỘ VÀ ĐỊA CHỈ THÔNG MINH (Phân biệt Hà Nội và TP.HCM)
        let addressStr = "Trung tâm Hội chợ và Triển lãm (Đang cập nhật)";
        let districtStr = "Chưa rõ";
        let lat = 10.776;
        let lng = 106.701; // Mặc định HCM

        const textLower = eventData.fullText.toLowerCase();

        // --- Cụm địa điểm TP.HCM ---
        if (
          textLower.includes("secc") ||
          textLower.includes("nguyễn văn linh")
        ) {
          addressStr = "Trung tâm Hội chợ và Triển lãm Sài Gòn (SECC)";
          districtStr = "Quận 7";
          lat = 10.7327;
          lng = 106.7218;
        } else if (
          textLower.includes("phú thọ") ||
          textLower.includes("quận 11")
        ) {
          addressStr = "Nhà thi đấu Phú Thọ";
          districtStr = "Quận 11";
          lat = 10.7705;
          lng = 106.6578;
        }
        // --- Cụm địa điểm Hà Nội ---
        else if (
          textLower.includes("i.c.e") ||
          textLower.includes("cung văn hóa")
        ) {
          addressStr = "Trung tâm Triển lãm Quốc tế I.C.E Hà Nội";
          districtStr = "Quận Hoàn Kiếm";
          lat = 21.0246;
          lng = 105.8427;
        } else if (
          textLower.includes("quốc gia hà nội") ||
          textLower.includes("necc") ||
          textLower.includes("ncc")
        ) {
          addressStr = "Trung tâm Hội nghị Quốc gia Hà Nội (NCC)";
          districtStr = "Quận Nam Từ Liêm";
          lat = 21.0069;
          lng = 105.7876;
        } else if (textLower.includes("hà nội")) {
          // Mặc định nếu nhắc đến Hà Nội nhưng không rõ tòa nhà
          addressStr = "Hà Nội";
          districtStr = "Quận Hoàn Kiếm";
          lat = 21.0285;
          lng = 105.8542;
        }

        // Giá vé
        let ticketPriceText = "Vào cửa tự do";
        if (
          eventData.fullText.match(
            /(Giá vé|Vé vào cổng|Chi phí)[\s:]+([^\n]+)/i,
          )
        ) {
          const match = eventData.fullText.match(
            /(Giá vé|Vé vào cổng|Chi phí)[\s:]+([^\n]+)/i,
          );
          ticketPriceText = match[2].trim();
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
          ticketPrice: ticketPriceText,
          status: "approved",
          type: "Triển lãm",
        });
      }
    }
  } catch (e) {
    console.error("❌ Lỗi cào dữ liệu Triển lãm:", e.message);
  } finally {
    await browser.close();
  }
  return results;
}

module.exports = scrapeTrienLam;
