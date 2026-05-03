import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ContributePage.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom"; // 1. Thêm useNavigate để nhảy trang
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Marker Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapFlyController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 16);
  }, [center, map]);
  return null;
}

function LocationMarker({ position, onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return position ? <Marker position={position} /> : null;
}

const ContributePage = () => {
  const navigate = useNavigate(); // 2. Khởi tạo navigate
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    ticketPrice: "",
    startDate: "",
    endDate: "",
    dailyOpeningTime: "07:00",
    dailyClosingTime: "21:00",
    isAllDay: false,
    isPermanent: false,
    closedDays: [],
    description: "",
    images: [],
    locations: [{ address: "", district: "", lat: 10.871, lng: 106.792 }],
  });

  const [searchMode, setSearchMode] = useState("auto");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previews, setPreviews] = useState([]);

  const daysOfWeek = [
    { label: "T2", value: 1 },
    { label: "T3", value: 2 },
    { label: "T4", value: 3 },
    { label: "T5", value: 4 },
    { label: "T6", value: 5 },
    { label: "T7", value: 6 },
    { label: "CN", value: 0 },
  ];

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchMode === "auto" && searchQuery.length > 2) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${searchQuery}&countrycodes=vn&limit=5`,
          );
          const data = await res.json();
          setSuggestions(data);
        } catch (err) {
          console.error("Lỗi lấy gợi ý:", err);
        }
      } else {
        setSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleDayToggle = (dayValue) => {
    const currentDays = [...formData.closedDays];
    const index = currentDays.indexOf(dayValue);
    index > -1 ? currentDays.splice(index, 1) : currentDays.push(dayValue);
    setFormData({ ...formData, closedDays: currentDays });
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 5) {
      Swal.fire({
        icon: "warning",
        title: "Evier ơi...",
        text: "Tối đa 5 ảnh thôi để giao diện đẹp nhất nhé!",
        confirmButtonColor: "#635bff",
      });
      return;
    }
    setFormData({ ...formData, images: [...formData.images, ...files] });
    setPreviews([
      ...previews,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeImage = (indexToRemove) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== indexToRemove),
    });
    setPreviews(previews.filter((_, i) => i !== indexToRemove));
  };

  const addLocation = () => {
    const newLocs = [
      ...formData.locations,
      { address: "", district: "", lat: 10.871, lng: 106.792 },
    ];
    setFormData({ ...formData, locations: newLocs });
    setActiveIndex(newLocs.length - 1);
  };

  const removeLocation = (indexToRemove) => {
    if (formData.locations.length > 1) {
      const newLocs = formData.locations.filter((_, i) => i !== indexToRemove);
      setFormData({ ...formData, locations: newLocs });
      if (activeIndex >= newLocs.length) setActiveIndex(newLocs.length - 1);
    }
  };

  const handleSelectSuggestion = (item) => {
    const { lat, lon, display_name, address } = item;
    const detectedDistrict =
      address.suburb || address.district || address.city_district || "";
    const newLocs = [...formData.locations];
    newLocs[activeIndex] = {
      ...newLocs[activeIndex],
      lat: parseFloat(lat).toFixed(6),
      lng: parseFloat(lon).toFixed(6),
      address: display_name,
      district: detectedDistrict,
    };
    setFormData({ ...formData, locations: newLocs });
    setSearchQuery("");
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- KIỂM TRA BẮT BUỘC ĐỊA ĐIỂM ---
    const hasInvalidLocation = formData.locations.some(
      (loc) => !loc.address || loc.address.trim() === "",
    );

    if (hasInvalidLocation) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu địa điểm!",
        text: "Vui lòng chọn hoặc nhập địa chỉ đầy đủ cho tất cả các địa điểm diễn ra nhé Evier!",
        confirmButtonColor: "#635bff",
      });
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append("title", formData.title);
    dataToSend.append("type", formData.type);
    dataToSend.append("ticketPrice", formData.ticketPrice);
    dataToSend.append("description", formData.description);
    dataToSend.append("isAllDay", formData.isAllDay);
    dataToSend.append("isPermanent", formData.isPermanent);
    dataToSend.append("dailyOpeningTime", formData.dailyOpeningTime);
    dataToSend.append("dailyClosingTime", formData.dailyClosingTime);

    if (!formData.isPermanent) {
      dataToSend.append("startDate", formData.startDate);
      dataToSend.append("endDate", formData.endDate);
    }

    dataToSend.append("locations", JSON.stringify(formData.locations));
    dataToSend.append("closedDays", JSON.stringify(formData.closedDays));

    formData.images.forEach((file) => {
      dataToSend.append("images", file);
    });

    try {
      const response = await axios.post(
        "http://localhost:5000/api/events/contribute",
        dataToSend,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      if (response.status === 201) {
        // --- CẬP NHẬT: NHẤN OK NHẢY RA TRANG CHỦ ---
        Swal.fire({
          icon: "success",
          title: "Tuyệt vời!",
          text: "Gửi thành công rồi Evier ơi! ✨",
          confirmButtonColor: "#635bff",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/"); // Nhảy về trang chủ
          }
        });
      }
    } catch (error) {
      console.error("Lỗi:", error.response?.data || error.message);
      Swal.fire({
        icon: "error",
        title: "Lỗi rồi...",
        text: "Vẫn lỗi rồi, Evier kiểm tra Terminal Backend nhé!",
        confirmButtonColor: "#ff4d4d",
      });
    }
  };

  return (
    <div className="contribute-container">
      <div className="contribute-card">
        <h1 className="contribute-title">Gợi ý sự kiện mới 🌟</h1>
        <form className="contribute-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>1. Thông tin sự kiện & Album ảnh</h3>
            <div className="form-group full-width">
              <label>
                Tên sự kiện <span className="required">*</span>
              </label>
              <input
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ví dụ: Triển lãm nghệ thuật..."
                required
              />
            </div>

            <div
              className="poster-upload-group"
              style={{ marginBottom: "20px" }}
            >
              <label>Hình ảnh sự kiện (Tối đa 5 ảnh)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                style={{ marginTop: "10px" }}
              />
              <div
                className="image-preview-list"
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "15px",
                }}
              >
                {previews.map((src, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      width: "100px",
                      height: "100px",
                    }}
                  >
                    <img
                      src={src}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-5px",
                        background: "#ff4d4d",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "22px",
                        height: "22px",
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Loại sự kiện</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn loại sự kiện</option>
                  <option value="Âm nhạc">🎵 Âm nhạc</option>
                  <option value="Ẩm thực">🍕 Ẩm thực</option>
                  <option value="Triển lãm">🎨 Triển lãm</option>
                  <option value="Ngoài trời">🌳 Ngoài trời</option>
                  <option value="Học thuật">💡 Học thuật</option>
                </select>
              </div>
              <div className="form-group">
                <label>Giá vé</label>
                <input
                  name="ticketPrice"
                  type="text"
                  value={formData.ticketPrice}
                  onChange={handleChange}
                  placeholder="Ví dụ: Miễn phí..."
                />
              </div>
            </div>

            <div className="toggle-options-grid">
              <div
                className={`modern-checkbox-card ${formData.isPermanent ? "active" : ""}`}
              >
                <input
                  type="checkbox"
                  id="isPermanent"
                  name="isPermanent"
                  checked={formData.isPermanent}
                  onChange={handleChange}
                />
                <label htmlFor="isPermanent">Mở cửa cố định (Hằng tuần)</label>
              </div>

              <div
                className={`modern-checkbox-card ${formData.isAllDay ? "active" : ""}`}
              >
                <input
                  type="checkbox"
                  id="isAllDay"
                  name="isAllDay"
                  checked={formData.isAllDay}
                  onChange={handleChange}
                />
                <label htmlFor="isAllDay">Diễn ra cả ngày (24/24)</label>
              </div>
            </div>

            {!formData.isPermanent ? (
              <div className="form-row" style={{ marginTop: "10px" }}>
                <div className="form-group">
                  <label>Từ ngày</label>
                  <input
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Đến ngày</label>
                  <input
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="form-group" style={{ marginTop: "10px" }}>
                <label>Ngày nghỉ hằng tuần:</label>
                <div style={{ display: "flex", gap: "8px", marginTop: "5px" }}>
                  {daysOfWeek.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleDayToggle(day.value)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1.5px solid #635bff",
                        background: formData.closedDays.includes(day.value)
                          ? "#ff4d4d"
                          : "white",
                        color: formData.closedDays.includes(day.value)
                          ? "white"
                          : "#635bff",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!formData.isAllDay && (
              <div className="form-row" style={{ marginTop: "10px" }}>
                <div className="form-group">
                  <label>Mở cửa lúc</label>
                  <input
                    name="dailyOpeningTime"
                    type="time"
                    value={formData.dailyOpeningTime}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Đóng cửa lúc</label>
                  <input
                    name="dailyClosingTime"
                    type="time"
                    value={formData.dailyClosingTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h3>2. Địa điểm diễn ra ({formData.locations.length})</h3>
              <button
                type="button"
                onClick={addLocation}
                style={{
                  padding: "8px 15px",
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                + Thêm địa điểm
              </button>
            </div>

            {formData.locations.map((loc, index) => (
              <div
                key={index}
                style={{
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  marginBottom: "10px",
                  background: activeIndex === index ? "#f8f9ff" : "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onClick={() => setActiveIndex(index)}
              >
                <span style={{ flex: 1 }}>
                  📍 {loc.address || `Địa điểm ${index + 1}`}
                </span>
                {formData.locations.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLocation(index);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ff4d4d",
                      fontSize: "18px",
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}

            <div
              style={{
                background: "#f0f0f0",
                borderRadius: "20px",
                padding: "4px",
                display: "inline-block",
                marginBottom: "15px",
              }}
            >
              <button
                type="button"
                onClick={() => setSearchMode("auto")}
                style={{
                  padding: "5px 15px",
                  borderRadius: "15px",
                  border: "none",
                  background: searchMode === "auto" ? "#635bff" : "transparent",
                  color: searchMode === "auto" ? "white" : "#666",
                }}
              >
                🔍 Tìm nhanh
              </button>
              <button
                type="button"
                onClick={() => setSearchMode("manual")}
                style={{
                  padding: "5px 15px",
                  borderRadius: "15px",
                  border: "none",
                  background:
                    searchMode === "manual" ? "#635bff" : "transparent",
                  color: searchMode === "manual" ? "white" : "#666",
                }}
              >
                ✍️ Nhập tay
              </button>
            </div>

            {searchMode === "auto" ? (
              <div style={{ position: "relative", marginBottom: "20px" }}>
                <input
                  type="text"
                  placeholder="🔍 Tìm địa chỉ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #635bff",
                  }}
                />
                {suggestions.length > 0 && (
                  <ul
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: "white",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      zIndex: 2000,
                      listStyle: "none",
                      padding: "5px",
                    }}
                  >
                    {suggestions.map((item, idx) => (
                      <li
                        key={idx}
                        onClick={() => handleSelectSuggestion(item)}
                        style={{
                          padding: "10px",
                          cursor: "pointer",
                          borderBottom: "1px solid #eee",
                          fontSize: "13px",
                        }}
                      >
                        📍 {item.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <input
                type="text"
                placeholder="Số nhà, tên đường..."
                value={formData.locations[activeIndex].address}
                onChange={(e) => {
                  const newLocs = [...formData.locations];
                  newLocs[activeIndex].address = e.target.value;
                  setFormData({ ...formData, locations: newLocs });
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #635bff",
                  marginBottom: "20px",
                }}
              />
            )}

            <div
              style={{
                height: "300px",
                borderRadius: "10px",
                overflow: "hidden",
                border: "1px solid #ddd",
              }}
            >
              <MapContainer
                center={[
                  formData.locations[activeIndex].lat,
                  formData.locations[activeIndex].lng,
                ]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi" />
                <MapFlyController
                  center={[
                    formData.locations[activeIndex].lat,
                    formData.locations[activeIndex].lng,
                  ]}
                />
                <LocationMarker
                  position={[
                    formData.locations[activeIndex].lat,
                    formData.locations[activeIndex].lng,
                  ]}
                  onSelect={(lat, lng) => {
                    const newLocs = [...formData.locations];
                    newLocs[activeIndex].lat = lat.toFixed(6);
                    newLocs[activeIndex].lng = lng.toFixed(6);
                    setFormData({ ...formData, locations: newLocs });
                  }}
                />
              </MapContainer>
            </div>
          </div>

          <div className="form-section">
            <h3>3. Nội dung chi tiết</h3>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả sự kiện..."
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            ></textarea>
          </div>

          <button
            type="submit"
            className="submit-btn"
            style={{
              width: "100%",
              padding: "15px",
              background: "#635bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "20px",
            }}
          >
            Gửi đóng góp cho EviGo 🛡️
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContributePage;
