import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function ClickHandler({ setPosition }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
    },
  });
  return null;
}

const LocationPicker = ({ onLocationSelect, initialPos }) => {
  const [position, setPosition] = useState(initialPos || [10.8707, 106.7941]); 
  React.useEffect(() => {
    onLocationSelect(position[0], position[1]);
  }, [position, onLocationSelect]);

  return (
    <div
      className="map-picker-wrapper"
      style={{ height: "350px", borderRadius: "12px", overflow: "hidden" }}
    >
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; Google Maps"
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi"
        />
        <ClickHandler setPosition={setPosition} />
        <Marker position={position} />
      </MapContainer>
    </div>
  );
};

export default LocationPicker;
