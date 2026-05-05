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

// Cấu hình Icon mặc định - Giữ nguyên của Như
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

// CẬP NHẬT: MapController dùng hàm moveEnd để đảm bảo an toàn, không gây crash
const MapController = ({ center, radius }) => {
  const map = useMap();

  useEffect(() => {
    if (map && center && center[0] && center[1]) {
      // Dùng timeout cực ngắn để đảm bảo layer đã load xong
      const timer = setTimeout(() => {
        try {
          const circle = L.circle(center, { radius: radius * 1000 });
          map.flyToBounds(circle.getBounds(), {
            padding: [40, 40],
            duration: 1.5,
          });
        } catch (e) {
          // Nếu vẫn lỗi, dùng flyTo đơn giản làm phương án dự phòng
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
  const [radius, setRadius] = useState(5); //
  const [userPos, setUserPos] = useState([10.7719, 106.6983]); //
  const [mapCenter, setMapCenter] = useState([10.7719, 106.6983]); //
  const [currentLocationMarker, setCurrentLocationMarker] = useState(null); //
  const [events, setEvents] = useState([]); //
  const [selectedEventId, setSelectedEventId] = useState(null); //

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
        <div className="sidebar left-panel">
          <h2 className="panel-title">Bộ lọc sự kiện</h2>
          <div className="panel-content">
            <div className="filter-group">
              <label>Tìm kiếm điểm đến</label>
              <div className="search-wrapper">
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Nhập địa điểm..."
                />
                <button className="search-icon-btn">🔍</button>
              </div>
            </div>
            <div className="filter-group">
              <label>V vị trí của tôi</label>
              <button className="btn-gps-locate" onClick={handleLocate}>
                📍 Xác định vị trí hiện tại
              </button>
            </div>
            <div className="filter-group">
              <label>Bán kính: {radius}km</label>
              <div className="range-container">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={radius}
                  className="filter-range"
                  onChange={(e) => setRadius(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="filter-group">
              <label>Thể loại</label>
              <select
                className="filter-select"
                style={{
                  width: "220px",
                  borderRadius: "10px",
                  padding: "10px",
                  border: "1px solid #d1d1f0",
                }}
              >
                <option>Tất cả thể loại</option>
                <option>Âm nhạc</option>
                <option>Triển lãm</option>
                <option>Ẩm thực</option>
                <option>Thể thao</option>
                <option>Học thuật</option>
              </select>
            </div>
            <button className="apply-filter-btn">Áp dụng bộ lọc</button>
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
                        mouseover: (e) => {
                          const marker = e.target;
                          if (marker && marker.openPopup) marker.openPopup();
                        },
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
