import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  Circle,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./MapPage.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
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

const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 14, { animate: true, duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
};

const MapPage = () => {
  const [radius, setRadius] = useState(5);
  const [userPos, setUserPos] = useState([10.7719, 106.6983]);
  const [mapCenter, setMapCenter] = useState([10.7719, 106.6983]);
  const [mapZoom, setMapZoom] = useState(13);

  // State quản lý Ghim vị trí hiện tại của Như
  const [currentLocationMarker, setCurrentLocationMarker] = useState(null);

  const events = [
    {
      id: 1,
      name: "Trường Đại học Nông Lâm",
      pos: [10.8707, 106.7941],
      address: "Linh Trung, Thủ Đức",
      shortDesc: "Đang mở cửa • 4.4 ⭐",
      fullDesc:
        "Cơ sở giáo dục đại học lâu đời với khuôn viên xanh ngát tại TP.HCM.",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzN7IqI6_1M0D3D_kP0X3T9_6_r_r_r_r_r_r",
    },
    {
      id: 2,
      name: "Sự kiện âm nhạc Quận 1",
      pos: [10.7719, 106.6983],
      address: "Bến Nghé, Quận 1",
      shortDesc: "Sắp diễn ra • 4.8 ⭐",
      fullDesc: "Đêm nhạc Acoustic sôi động tại trung tâm thành phố.",
      img: "https://via.placeholder.com/150",
    },
  ];

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const newPos = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(newPos);
        setMapCenter(newPos);
        setMapZoom(15);
        setCurrentLocationMarker(newPos);
      });
    }
  };

  const handleEventClick = (eventPos) => {
    setMapCenter(eventPos);
    setMapZoom(16);
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
              <label>Vị trí của tôi</label>
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
                  onChange={(e) => setRadius(e.target.value)}
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
                <option>Hội thảo</option>
              </select>
            </div>

            <button className="apply-filter-btn">Áp dụng bộ lọc</button>
          </div>
        </div>

        {/* BẢN ĐỒ */}
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
            <MapController center={mapCenter} zoom={mapZoom} />

            {currentLocationMarker && (
              <Marker position={currentLocationMarker} icon={myLocationIcon}>
                <Popup>
                  <div style={{ textAlign: "center" }}>
                    <strong style={{ color: "red" }}>🔴 Bạn đang ở đây!</strong>
                    <br />
                    EviGo đã xác định được vị trí của bạn.
                  </div>
                </Popup>
              </Marker>
            )}

            <Circle
              center={userPos}
              radius={radius * 1000}
              pathOptions={{
                color: "#635bff",
                fillColor: "#635bff",
                fillOpacity: 0.15,
              }}
            />

            {events.map((ev) => (
              <Marker key={ev.id} position={ev.pos}>
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  <div className="map-hover-box">
                    <strong>{ev.name}</strong>
                    <p>{ev.shortDesc}</p>
                  </div>
                </Tooltip>
                <Popup maxWidth={280}>
                  <div className="map-click-box">
                    <img src={ev.img} alt="event" className="popup-img" />
                    <h4>{ev.name}</h4>
                    <p className="popup-addr">{ev.address}</p>
                    <p className="popup-text">{ev.fullDesc}</p>
                    <button className="btn-go-here">
                      Xem chi tiết sự kiện
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* DANH SÁCH */}
        <div className="sidebar right-panel">
          <h2 className="panel-title">Sự kiện gần đây</h2>
          <div className="event-scroll-area">
            {events.map((ev) => (
              <div
                className="event-item-card clickable"
                key={ev.id}
                onClick={() => handleEventClick(ev.pos)}
              >
                <div className="event-info">
                  <h4>{ev.name}</h4>
                  <p>Địa điểm: {ev.address}</p>
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
