const puppeteer = require("puppeteer");

async function scrapeTrienLam() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  const results = [];
  const CURRENT_YEAR = 2026;

  try {
    let allEventLinks = [];

    // 1. KHAI BÁO CÁC CHUYÊN MỤC CẦN CÀO
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

    console.log(`🔍 Bắt đầu quét chuyên mục Triển lãm...`);

    // 2. GOM LINK TỪ CÁC CHUYÊN MỤC
    for (let category of categories) {
      await page.goto(category.url, { waitUntil: "networkidle2" });
      const linksOnPage = await page.evaluate(() => {
        return Array.from(
          document.querySelectorAll("h2 a, h3 a, .event-title a"),
        ).map((a) => a.href);
      });
      allEventLinks.push(...linksOnPage);
    }

    const uniqueLinks = [...new Set(allEventLinks)];
    console.log(
      `\n🚀 Tổng cộng tìm thấy ${uniqueLinks.length} triển lãm. Bắt đầu cào chi tiết...`,
    );

    // 3. CÀO CHI TIẾT TỪNG BÀI
    for (let link of uniqueLinks) {
      await page.goto(link, { waitUntil: "networkidle2" });

      const eventData = await page.evaluate(() => {
        // --- 1. LẤY ẢNH "CHỐNG MÙ" (Đa tầng bảo vệ, chống lấy nhầm logo) ---
        const getSmartImage = () => {
          const featuredImg = document.querySelector(
            ".td-post-featured-image img, .entry-thumb img",
          );
          if (
            featuredImg &&
            featuredImg.src &&
            !featuredImg.src.toLowerCase().includes("logo")
          )
            return featuredImg.src;

          const contentImg = document.querySelector(
            ".entry-content img, .post-content img, #content img",
          );
          if (
            contentImg &&
            contentImg.src &&
            !contentImg.src.toLowerCase().includes("logo")
          )
            return contentImg.src;

          const og = document.querySelector(
            'meta[property="og:image"]',
          )?.content;
          if (og && !og.toLowerCase().includes("logo")) return og;

          const anyImg = Array.from(document.querySelectorAll("img")).find(
            (img) =>
              img.src &&
              !img.src.toLowerCase().includes("logo") &&
              img.clientWidth > 200,
          );
          if (anyImg) return anyImg.src;

          return "";
        };

        const image = getSmartImage();
        const bodyText = document.body.innerText;

        // --- 2. VÉT MÁNG NỘI DUNG (Hỗ trợ Page Builder) ---
        const contentArea =
          document.querySelector(".entry-content") ||
          document.querySelector("#content") ||
          document.body;
        let formattedText = [];
        let lastText = "";

        if (contentArea) {
          const elements = contentArea.querySelectorAll(
            "h2, h3, h4, h5, p, li, .wpb_wrapper > div, .elementor-widget-text-editor, .elementor-icon-box-content",
          );
          elements.forEach((el) => {
            let text = el.innerText.trim();
            let tag = el.tagName.toLowerCase();

            // Lọc rác
            if (
              text.length < 10 ||
              text === lastText ||
              text.includes("Bản quyền") ||
              text.includes("Trang chủ") ||
              text.includes("Dịch vụ")
            )
              return;

            // Format thẻ đẹp mắt
            if (
              tag.match(/^h[2-6]$/) ||
              el.classList.contains("elementor-heading-title")
            ) {
              formattedText.push(`\n🔥 ${text.toUpperCase()} 🔥\n`);
            } else if (
              tag === "li" ||
              text.startsWith("-") ||
              text.startsWith("•")
            ) {
              formattedText.push(`  - ${text}`);
            } else {
              if (text.length < 80 && el.querySelector("strong, b")) {
                formattedText.push(`\n🔸 ${text}`);
              } else {
                formattedText.push(`${text}\n`);
              }
            }
            lastText = text;
          });
        }

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
        // --- 3. XỬ LÝ NGÀY THÁNG ---
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

        // --- 4. ĐỊA CHỈ THÔNG MINH ---
        let addressStr = "Đang cập nhật";
        let districtStr = "Chưa rõ";
        let lat = 10.776;
        let lng = 106.701;

        const textLower = eventData.fullText.toLowerCase();

        if (
          textLower.includes("secc") ||
          textLower.includes("nguyễn văn linh")
        ) {
          addressStr =
            "Trung tâm Hội chợ và Triển lãm Sài Gòn (SECC), Quận 7, TP.HCM";
          districtStr = "Quận 7";
          lat = 10.7327;
          lng = 106.7218;
        } else if (
          textLower.includes("phú thọ") ||
          textLower.includes("quận 11")
        ) {
          addressStr = "Nhà thi đấu Phú Thọ, Quận 11, TP.HCM";
          districtStr = "Quận 11";
          lat = 10.7705;
          lng = 106.6578;
        } else if (
          textLower.includes("i.c.e") ||
          textLower.includes("cung văn hóa") ||
          textLower.includes("trần hưng đạo")
        ) {
          addressStr =
            "Trung tâm Triển lãm Quốc tế I.C.E, Quận Hoàn Kiếm, Hà Nội";
          districtStr = "Quận Hoàn Kiếm";
          lat = 21.0246;
          lng = 105.8427;
        } else if (
          textLower.includes("quốc gia hà nội") ||
          textLower.includes("ncc") ||
          textLower.includes("necc") ||
          textLower.includes("cung triển lãm kiến trúc")
        ) {
          addressStr =
            "Cung Triển lãm Kiến trúc, Quy hoạch Xây dựng Quốc gia (NECC), Hà Nội";
          districtStr = "Nam Từ Liêm";
          lat = 21.0069;
          lng = 105.7876;
        } else {
          const addressMatch = eventData.fullText.match(
            /(?:Địa điểm|Tại|Tổ chức tại|Location)[\s:]+([^\n]+)/i,
          );
          if (addressMatch) {
            addressStr = addressMatch[1].trim();
            districtStr = "Chưa rõ";
          }
        }

        // --- 5. XỬ LÝ GIÁ VÉ ---
        let ticketPriceText = "Vào cửa tự do";

        const priceMatch = eventData.fullText.match(
          /(Giá vé|Vé vào cổng)[\s:]+([^\n]{1,60})/i,
        );

        if (priceMatch) {
          ticketPriceText = priceMatch[2].trim();
          if (ticketPriceText.length > 50) {
            ticketPriceText = "Vào cửa tự do";
          }
        } else if (eventData.fullText.toLowerCase().includes("miễn phí")) {
          ticketPriceText = "Miễn phí";
        }

        // --- 6. PHÂN LOẠI THỂ LOẠI (TYPE) THÔNG MINH BẰNG TỪ KHÓA ---
        let eventType = "Triển lãm"; // Mặc định chung
        const titleLower = eventData.title.toLowerCase();

        if (
          titleLower.includes("thực phẩm") ||
          titleLower.includes("food") ||
          titleLower.includes("đồ uống") ||
          titleLower.includes("beverage")
        ) {
          eventType = "Thực phẩm & Đồ uống";
        } else if (
          titleLower.includes("y tế") ||
          titleLower.includes("medical") ||
          titleLower.includes("dược phẩm") ||
          titleLower.includes("chăm sóc sức khỏe") ||
          titleLower.includes("medipharm")
        ) {
          eventType = "Y tế & Sức khỏe";
        } else if (
          titleLower.includes("công nghiệp") ||
          titleLower.includes("cơ khí") ||
          titleLower.includes("máy móc") ||
          titleLower.includes("tự động hóa") ||
          titleLower.includes("industry")
        ) {
          eventType = "Công nghiệp & Cơ khí";
        } else if (
          titleLower.includes("nội thất") ||
          titleLower.includes("gỗ") ||
          titleLower.includes("kiến trúc") ||
          titleLower.includes("furniture") ||
          titleLower.includes("wood")
        ) {
          eventType = "Nội thất & Kiến trúc";
        } else if (
          titleLower.includes("nông nghiệp") ||
          titleLower.includes("agriculture") ||
          titleLower.includes("thủy sản") ||
          titleLower.includes("chăn nuôi")
        ) {
          eventType = "Nông Lâm Thủy sản";
        } else if (
          titleLower.includes("xây dựng") ||
          titleLower.includes("vật liệu") ||
          titleLower.includes("construction") ||
          titleLower.includes("build") ||
          titleLower.includes("vietbuild")
        ) {
          eventType = "Xây dựng";
        } else if (
          titleLower.includes("công nghệ") ||
          titleLower.includes("điện tử") ||
          titleLower.includes("ict") ||
          titleLower.includes("tech") ||
          titleLower.includes("telecom")
        ) {
          eventType = "Công nghệ & Điện tử";
        } else if (
          titleLower.includes("du lịch") ||
          titleLower.includes("tourism") ||
          titleLower.includes("khách sạn") ||
          titleLower.includes("hotel")
        ) {
          eventType = "Du lịch & Khách sạn";
        } else if (
          titleLower.includes("thời trang") ||
          titleLower.includes("dệt may") ||
          titleLower.includes("fashion") ||
          titleLower.includes("da giày")
        ) {
          eventType = "Thời trang & Dệt may";
        } else if (
          titleLower.includes("mẹ và bé") ||
          titleLower.includes("baby") ||
          titleLower.includes("mom") ||
          titleLower.includes("maternity")
        ) {
          eventType = "Mẹ và Bé";
        } else if (
          titleLower.includes("giáo dục") ||
          titleLower.includes("du học") ||
          titleLower.includes("education")
        ) {
          eventType = "Giáo dục";
        } else if (
          titleLower.includes("phòng cháy") ||
          titleLower.includes("chữa cháy") ||
          titleLower.includes("an ninh") ||
          titleLower.includes("security")
        ) {
          eventType = "An ninh & PCCC";
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
          type: eventType, // Gán thể loại đã nhận diện được
        });
      }
    }
  } catch (e) {
    console.error("❌ Lỗi cào dữ liệu:", e.message);
  } finally {
    await browser.close();
  }
  return results;
}

module.exports = scrapeTrienLam;
