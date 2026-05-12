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
import toast from "react-hot-toast";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./MapPage.css";

// --- CẤU HÌNH ICON ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const filteredIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
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

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

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
  const [isFiltered, setIsFiltered] = useState(false);
  const [isLocationFixed, setIsLocationFixed] = useState(false);
  const [radius, setRadius] = useState(5);
  const [userPos, setUserPos] = useState([10.7719, 106.6983]);
  const [mapCenter, setMapCenter] = useState([10.7719, 106.6983]);
  const [currentLocationMarker, setCurrentLocationMarker] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const [selectedTypes, setSelectedTypes] = useState(["Tất cả"]);
  const [selectedTimes, setSelectedTimes] = useState(["Tất cả"]);
  const [customDate, setCustomDate] = useState("");
  const [startLocation, setStartLocation] = useState("");

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
    return `http://localhost:5000/${path.replace(/\\/g, "/")}`;
  };

  const getShortAddress = (address) => {
    if (!address) return "Chưa cập nhật";
    const parts = address.split(",");
    return parts.length >= 3
      ? `${parts[parts.length - 3].trim()}, ${parts[parts.length - 2].trim()}`
      : address;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/events/approved",
        );
        setEvents(res.data);
        setFilteredEvents(res.data);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
      }
    };
    fetchEvents();
  }, []);

  const handleSearchLocation = async () => {
    if (!startLocation.trim()) return;
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(startLocation)}`,
      );
      if (res.data && res.data.length > 0) {
        const newPos = [
          parseFloat(res.data[0].lat),
          parseFloat(res.data[0].lon),
        ];
        setUserPos(newPos);
        setMapCenter(newPos);
        setCurrentLocationMarker(newPos);
        setIsLocationFixed(true);
      } else {
        toast.error("Hông tìm thấy địa điểm này rồi Như ơi!");
      }
    } catch (e) {
      toast.error("Lỗi kết nối bản đồ!");
    }
  };

  const handleTypeClick = (type) => {
    if (type === "Tất cả") {
      setSelectedTypes(["Tất cả"]);
      return;
    }
    let newTypes = selectedTypes.filter((t) => t !== "Tất cả");
    if (newTypes.includes(type)) {
      newTypes = newTypes.filter((t) => t !== type);
      if (newTypes.length === 0) newTypes = ["Tất cả"];
    } else {
      newTypes.push(type);
    }
    setSelectedTypes(newTypes);
  };

  const handleTimeClick = (time) => {
    if (time === "Tất cả") {
      setSelectedTimes(["Tất cả"]);
      setCustomDate("");
      return;
    }
    let newTimes = selectedTimes.filter((t) => t !== "Tất cả");
    if (newTimes.includes(time)) {
      newTimes = newTimes.filter((t) => t !== time);
      if (newTimes.length === 0) newTimes = ["Tất cả"];
    } else {
      newTimes.push(time);
    }
    setSelectedTimes(newTimes);
  };

  const handleApplyFilter = () => {
    const today = new Date().toDateString();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toDateString();

    let result = events.filter((ev) => {
      const matchesType =
        selectedTypes.includes("Tất cả") ||
        selectedTypes.some(
          (t) => (ev.category && ev.category.includes(t)) || ev.type === t,
        );

      let matchesDistance = true;
      if (isLocationFixed && ev.locations?.length > 0) {
        matchesDistance = ev.locations.some(
          (loc) =>
            getDistance(
              userPos[0],
              userPos[1],
              parseFloat(loc.lat),
              parseFloat(loc.lng),
            ) <= radius,
        );
      }

      let matchesTime = false;
      if (selectedTimes.includes("Tất cả") && !customDate) {
        matchesTime = true;
      } else {
        const timeChecks = selectedTimes.map((t) => {
          if (t === "Hôm nay")
            return (
              ev.isPermanent ||
              (ev.startDate && new Date(ev.startDate).toDateString() === today)
            );
          if (t === "Ngày mai")
            return (
              ev.isPermanent ||
              (ev.startDate &&
                new Date(ev.startDate).toDateString() === tomorrowStr)
            );
          if (t === "Cuối tuần") {
            const day = new Date(ev.startDate).getDay();
            return ev.isPermanent || day === 0 || day === 6;
          }
          return false;
        });
        const matchesCustom =
          customDate &&
          (ev.isPermanent ||
            (ev.startDate &&
              new Date(ev.startDate).toDateString() ===
                new Date(customDate).toDateString()));
        matchesTime = timeChecks.some((c) => c === true) || matchesCustom;
      }
      return matchesType && matchesDistance && matchesTime;
    });

    setFilteredEvents(result);
    setIsFiltered(true);
    setSelectedEventId(null);
    if (result.length > 0) {
      toast.success(`Tìm thấy ${result.length} sự kiện cho Như nè! ✨`, {
        style: {
          borderRadius: "15px",
          background: "#635bff",
          color: "#fff",
          fontWeight: "600",
        },
      });
    } else {
      toast.error("Hổng có sự kiện nào khớp bộ lọc rồi Như ơi! 🌸");
    }
  };

  const handleShowAll = () => {
    setFilteredEvents(events);
    setIsFiltered(false);
    setIsLocationFixed(false);
    setCurrentLocationMarker(null);
    setStartLocation("");
    setSelectedTimes(["Tất cả"]);
    setSelectedTypes(["Tất cả"]);
    setCustomDate("");
  };

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const newPos = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(newPos);
        setMapCenter(newPos);
        setCurrentLocationMarker(newPos);
        setIsLocationFixed(true);
        setStartLocation("Vị trí hiện tại của tôi");
      });
    }
  };

  const handleEventClick = (ev, loc) => {
    if (loc) {
      setMapCenter([parseFloat(loc.lat), parseFloat(loc.lng)]);
      setSelectedEventId(ev._id);
    }
  };

  return (
    <div className="map-page-wrapper">
      <div className="map-page-container">
        <div className="sidebar left-panel">
          <h2 className="panel-title">Bộ lọc sự kiện 🔍</h2>
          <div className="panel-content scrollable-filters">
            <div className="filter-card">
              <label className="filter-label">Vị trí của bạn</label>
              <div className="search-wrapper">
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Nhập KTX, Quận 1..."
                  value={startLocation}
                  onChange={(e) => {
                    setStartLocation(e.target.value);
                    if (!e.target.value) setIsLocationFixed(false);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchLocation()}
                />
                <button
                  className="search-icon-btn"
                  onClick={handleSearchLocation}
                >
                  🔍
                </button>
              </div>
              <button
                className="btn-gps-locate modern-btn"
                onClick={handleLocate}
              >
                📍 Vị trí hiện tại
              </button>
            </div>

            <div
              className={`filter-card ${!isLocationFixed ? "disabled-logic" : ""}`}
              style={{ opacity: isLocationFixed ? 1 : 0.6 }}
            >
              <div className="label-row">
                <label className="filter-label">Bán kính</label>
                <span className="range-value">{radius}km</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={radius}
                disabled={!isLocationFixed}
                className="filter-range modern-slider"
                onChange={(e) => setRadius(Number(e.target.value))}
              />
              {!isLocationFixed && (
                <p
                  style={{
                    fontSize: "10px",
                    color: "#ff4d4d",
                    marginTop: "5px",
                  }}
                >
                  * Xác định vị trí để chọn bán kính
                </p>
              )}
            </div>

            <div className="filter-card">
              <label className="filter-label">Thời gian (Chọn nhiều)</label>
              <div className="filter-chips">
                {timeFilters.map((t) => (
                  <button
                    key={t}
                    className={`chip ${selectedTimes.includes(t) ? "active" : ""}`}
                    onClick={() => handleTimeClick(t)}
                  >
                    {t}
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
                    if (e.target.value)
                      setSelectedTimes((p) => p.filter((x) => x !== "Tất cả"));
                  }}
                />
              </div>
            </div>

            <div className="filter-card">
              <label className="filter-label">Thể loại (Chọn nhiều)</label>
              <div className="filter-chips">
                {eventTypes.map((t) => (
                  <button
                    key={t}
                    className={`chip ${selectedTypes.includes(t) ? "active" : ""}`}
                    onClick={() => handleTypeClick(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <button
                className="apply-filter-btn modern-apply-btn"
                onClick={handleApplyFilter}
              >
                Áp dụng bộ lọc ✨
              </button>
              {isFiltered && (
                <button
                  className="show-all-btn"
                  onClick={handleShowAll}
                  style={{
                    background: "#eee",
                    color: "#333",
                    border: "none",
                    padding: "10px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Xem tất cả sự kiện 🔄
                </button>
              )}
            </div>
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
                    <strong style={{ color: "red" }}>
                      🔴 Tâm điểm tìm kiếm
                    </strong>
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
              ev.locations?.map((loc, i) => {
                const isMatched = filteredEvents.some(
                  (fEv) => fEv._id === ev._id,
                );
                let markerIcon = new L.Icon.Default();
                if (ev._id === selectedEventId) markerIcon = selectedIcon;
                else if (isFiltered && isMatched) markerIcon = filteredIcon;

                return (
                  <Marker
                    key={`${ev._id}-${i}`}
                    position={[parseFloat(loc.lat), parseFloat(loc.lng)]}
                    icon={markerIcon}
                    eventHandlers={{
                      mouseover: (e) => e.target.openPopup(),
                      click: () => setSelectedEventId(ev._id),
                    }}
                  >
                    <Popup maxWidth={280}>
                      <div className="map-click-box">
                        <img
                          src={getFullImageUrl(ev.image)}
                          alt="ev"
                          className="popup-img"
                        />
                        <h4>{ev.title}</h4>
                        {isFiltered && isMatched && (
                          <span
                            style={{
                              color: "#635bff",
                              fontWeight: "bold",
                              fontSize: "10px",
                            }}
                          >
                            ✨ Khớp bộ lọc
                          </span>
                        )}
                        <p className="popup-addr">{loc.address}</p>
                        <button
                          className="btn-go-here"
                          onClick={() => navigate(`/event/${ev._id}`)}
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              }),
            )}
          </MapContainer>
        </div>

        <div className="sidebar right-panel">
          <h2 className="panel-title">
            {isFiltered
              ? `Kết quả lọc (${filteredEvents.length})`
              : `Sự kiện gần đây (${events.length})`}
          </h2>
          <div className="event-scroll-area">
            {(isFiltered ? filteredEvents : events).length > 0 ? (
              (isFiltered ? filteredEvents : events).map((ev) => (
                <div
                  className="event-item-card clickable"
                  key={ev._id}
                  onClick={() => navigate(`/event/${ev._id}`)}
                >
                  <div className="event-info">
                    <h4>{ev.title}</h4>
                    <p>📍 {getShortAddress(ev.locations?.[0]?.address)}</p>
                    <p>⭐ 4.4 (653 đánh giá)</p>
                    <div
                      className="click-hint-wrapper"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(ev, ev.locations?.[0]);
                      }}
                      style={{ display: "inline-block", marginTop: "5px" }}
                    >
                      <span className="click-hint">
                        📍 Nhấn để xem trên bản đồ
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p
                className="empty-msg"
                style={{ textAlign: "center", padding: "20px", color: "#666" }}
              >
                Hông có sự kiện nào hết Như ơi! 🌸
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
