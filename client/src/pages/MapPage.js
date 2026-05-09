import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./MapPage.css";

// Cấu hình Icon mặc định - Giữ nguyên
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const selectedIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [30, 50],
  iconAnchor: [15, 50],
  popupAnchor: [1, -40],
  shadowSize: [50, 50],
});

const myLocationIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [30, 50],
  iconAnchor: [15, 50],
  popupAnchor: [1, -40],
  shadowSize: [50, 50],
});

const MapController = ({ center, radius }) => {
  const map = useMap();
  useEffect(() => {
    if (map && center && center[0] && center[1]) {
      const timer = setTimeout(() => {
        try {
          const circle = L.circle(center, { radius: radius * 1000 });
          map.flyToBounds(circle.getBounds(), {
            padding: [40, 40],
            duration: 1.5,
          });
        } catch (e) {
          map.flyTo(center, 13);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [center, radius, map]);
  return null;
};

const MapPage = () => {
  const navigate = useNavigate();
  const [radius, setRadius] = useState(5);
  const [userPos, setUserPos] = useState([10.7719, 106.6983]);
  const [mapCenter, setMapCenter] = useState([10.7719, 106.6983]);
  const [currentLocationMarker, setCurrentLocationMarker] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);

  // State bộ lọc
  const [selectedType, setSelectedType] = useState("Tất cả");
  const [selectedTime, setSelectedTime] = useState("Tất cả");
  const [customDate, setCustomDate] = useState("");
  const [startLocation, setStartLocation] = useState(""); // State cho điểm xuất phát

  const eventTypes = [
    "Tất cả",
    "Âm nhạc",
    "Triển lãm",
    "Ẩm thực",
    "Thể thao",
    "Học thuật",
  ];
  const timeFilters = ["Tất cả", "Hôm nay", "Ngày mai", "Cuối tuần"];

  const getFullImageUrl = (path) => {
    if (!path) return "/default-banner.jpg";
    if (path.startsWith("http")) return path;
    const cleanPath = path.replace(/\\/g, "/");
    return `http://localhost:5000/${cleanPath}`;
  };

  const getShortAddress = (address) => {
    if (!address) return "Chưa cập nhật";
    const parts = address.split(",");
    if (parts.length >= 3) {
      return `${parts[parts.length - 3].trim()}, ${parts[parts.length - 2].trim()}`;
    }
    return address;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/events/approved",
        );
        setEvents(res.data);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu bản đồ:", err);
      }
    };
    fetchEvents();
  }, []);

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const newPos = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(newPos);
        setMapCenter(newPos);
        setCurrentLocationMarker(newPos);
        setSelectedEventId(null);
        setStartLocation(""); // Xóa text nhập tay khi dùng GPS
      });
    }
  };

  const handleEventClick = (eventObj, locationObj) => {
    if (locationObj && locationObj.lat && locationObj.lng) {
      const safePos = [
        parseFloat(locationObj.lat),
        parseFloat(locationObj.lng),
      ];
      setMapCenter(safePos);
      setSelectedEventId(eventObj._id);
    }
  };

  return (
    <div className="map-page-wrapper">
      <div className="map-page-container">
        {/* SIDEBAR TRÁI TỐI ƯU */}
        <div className="sidebar left-panel">
          <h2 className="panel-title">Bộ lọc sự kiện 🔍</h2>
          <div className="panel-content scrollable-filters">
            {/* Nhóm 1: Điểm khởi hành (Cập nhật Nơi đi - Nơi đến) */}
            <div className="filter-card">
              <label className="filter-label">Vị trí của bạn</label>
              <div className="search-wrapper">
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Nhập điểm xuất phát..."
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                />
                <button className="search-icon-btn">🔍</button>
              </div>
              <button
                className="btn-gps-locate modern-btn"
                onClick={handleLocate}
              >
                📍 Vị trí hiện tại
              </button>
              <p
                style={{
                  fontSize: "11px",
                  color: "#635bff",
                  marginTop: "8px",
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                * Hệ thống sẽ tìm sự kiện quanh điểm này
              </p>
            </div>

            {/* Nhóm 2: Bán kính */}
            <div className="filter-card">
              <div className="label-row">
                <label className="filter-label">Bán kính</label>
                <span className="range-value">{radius}km</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={radius}
                className="filter-range modern-slider"
                onChange={(e) => setRadius(Number(e.target.value))}
              />
            </div>

            {/* Nhóm 3: Thời gian */}
            <div className="filter-card">
              <label className="filter-label">Thời gian</label>
              <div className="filter-chips">
                {timeFilters.map((time) => (
                  <button
                    key={time}
                    className={`chip ${selectedTime === time ? "active" : ""}`}
                    onClick={() => {
                      setSelectedTime(time);
                      setCustomDate("");
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
              <div
                className="date-picker-container"
                style={{ marginTop: "12px" }}
              >
                <input
                  type="date"
                  className="modern-date-input"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    if (e.target.value) setSelectedTime("Tùy chọn");
                  }}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "10px",
                    border: "1.5px solid #d1d1f0",
                    fontSize: "13px",
                    outline: "none",
                    cursor: "pointer",
                  }}
                />
              </div>
            </div>

            {/* Nhóm 4: Thể loại */}
            <div className="filter-card">
              <label className="filter-label">Thể loại</label>
              <div className="filter-chips">
                {eventTypes.map((type) => (
                  <button
                    key={type}
                    className={`chip ${selectedType === type ? "active" : ""}`}
                    onClick={() => setSelectedType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <button className="apply-filter-btn modern-apply-btn">
              Áp dụng bộ lọc ✨
            </button>
          </div>
        </div>

        <div className="map-center-panel">
          <MapContainer
            center={userPos}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution="&copy; Google Maps"
              url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi"
            />
            <MapController center={mapCenter} radius={radius} />

            {currentLocationMarker && (
              <>
                <Marker position={currentLocationMarker} icon={myLocationIcon}>
                  <Popup>
                    <div style={{ textAlign: "center" }}>
                      <strong style={{ color: "red" }}>
                        🔴 Bạn đang ở đây!
                      </strong>
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={currentLocationMarker}
                  radius={radius * 1000}
                  pathOptions={{
                    color: "#635bff",
                    fillColor: "#635bff",
                    fillOpacity: 0.15,
                    weight: 2,
                  }}
                />
              </>
            )}

            {events.map((ev) =>
              ev.locations?.map((loc, idx) => {
                const lat = parseFloat(loc.lat);
                const lng = parseFloat(loc.lng);
                if (!isNaN(lat) && !isNaN(lng)) {
                  return (
                    <Marker
                      key={`${ev._id}-${idx}`}
                      position={[lat, lng]}
                      icon={
                        ev._id === selectedEventId
                          ? selectedIcon
                          : new L.Icon.Default()
                      }
                      eventHandlers={{
                        mouseover: (e) => e.target.openPopup(),
                        click: () => setSelectedEventId(ev._id),
                      }}
                    >
                      <Popup maxWidth={280}>
                        <div className="map-click-box">
                          <img
                            src={getFullImageUrl(ev.image)}
                            alt="event"
                            className="popup-img"
                          />
                          <h4>{ev.title}</h4>
                          <p className="popup-addr">{loc.address}</p>
                          <button
                            className="btn-go-here"
                            onClick={() => navigate(`/event/${ev._id}`)}
                          >
                            Xem chi tiết sự kiện
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                }
                return null;
              }),
            )}
          </MapContainer>
        </div>

        <div className="sidebar right-panel">
          <h2 className="panel-title">Sự kiện gần đây</h2>
          <div className="event-scroll-area">
            {events.map((ev) => (
              <div
                className="event-item-card clickable"
                key={ev._id}
                onClick={() => handleEventClick(ev, ev.locations?.[0])}
              >
                <div className="event-info">
                  <h4>{ev.title}</h4>
                  <p>📍 {getShortAddress(ev.locations?.[0]?.address)}</p>
                  <p>⭐ 4.4 (653 đánh giá)</p>
                  <span className="click-hint">📍 Nhấn để xem trên bản đồ</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
