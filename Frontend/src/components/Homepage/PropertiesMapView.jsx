import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const DEFAULT_CENTER = [20.5937, 78.9629];

const getCenter = (properties) => {
  if (!Array.isArray(properties) || properties.length === 0) {
    return DEFAULT_CENTER;
  }

  const validLocations = properties.filter(
    (property) => property?.location?.lat && property?.location?.lng
  );

  if (!validLocations.length) {
    return DEFAULT_CENTER;
  }

  const total = validLocations.reduce(
    (acc, property) => {
      acc.lat += Number(property.location.lat);
      acc.lng += Number(property.location.lng);
      return acc;
    },
    { lat: 0, lng: 0 }
  );

  return [total.lat / validLocations.length, total.lng / validLocations.length];
};

function PropertiesMapView({ properties = [] }) {
  const center = getCenter(properties);
  const markers = properties.filter(
    (property) => property?.location?.lat && property?.location?.lng
  );

  return (
    <MapContainer
      center={center}
      zoom={markers.length > 1 ? 5 : 7}
      scrollWheelZoom
      style={{ height: "100%", width: "100%", minHeight: "320px", borderRadius: "20px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map((property) => (
        <Marker key={property._id} position={[property.location.lat, property.location.lng]}>
          <Popup>
            <div className="space-y-1">
              <p className="font-semibold text-sm">{property.title}</p>
              <p className="text-xs text-gray-600">
                {property.city}, {property.state}
              </p>
              <p className="text-xs text-gray-800">Rs {property.price} / night</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default PropertiesMapView;
