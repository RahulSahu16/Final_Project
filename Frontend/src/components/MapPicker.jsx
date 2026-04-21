import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

function ClickHandler({ onChange }) {
  useMapEvents({
    async click(event) {
      const lat = Number(event.latlng.lat.toFixed(6));
      const lng = Number(event.latlng.lng.toFixed(6));

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await res.json();

        const address = data.display_name || "";

        onChange({
          lat,
          lng,
          address, // 👈 NEW
        });
      } catch (err) {
        console.error("Error fetching address", err);
        onChange({ lat, lng });
      }
    },
  });

  return null;
}

export default function MapPicker({ value, onChange }) {
  const center = value || { lat: 20.5937, lng: 78.9629 };

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={5}
      scrollWheelZoom
      style={{ height: "300px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {value ? <Marker position={[value.lat, value.lng]} /> : null}
      <ClickHandler onChange={onChange} />
    </MapContainer>
  );
}
