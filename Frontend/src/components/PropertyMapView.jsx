import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

export default function PropertyMapView({ location, address }) {
  if (!location?.lat || !location?.lng) return null;

  return (
    <MapContainer
      center={[location.lat, location.lng]}
      zoom={14}
      scrollWheelZoom
      style={{ height: "280px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[location.lat, location.lng]}>
        <Popup>{address || "Property location"}</Popup>
      </Marker>
    </MapContainer>
  );
}
