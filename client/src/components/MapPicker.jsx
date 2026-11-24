import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Info } from 'lucide-react';

// Fix default Leaflet icon paths in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to handle map clicks
function LocationMarker({ position, setPosition, onLocationSelect }) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

const MapPicker = ({ defaultLat = 28.6315, defaultLng = 77.2195, onLocationChange }) => {
  const [position, setPosition] = useState([defaultLat, defaultLng]);
  const [locating, setLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    onLocationChange(position[0], position[1]);
  }, []);

  const handleLocationSelect = (lat, lng) => {
    setPosition([lat, lng]);
    onLocationChange(lat, lng);
    setErrorMsg('');
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        onLocationChange(latitude, longitude);
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setErrorMsg('Could not detect location automatically. Please click on the map to set location.');
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Pin Issue Location on Map <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={locating}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-md transition-colors self-start"
        >
          <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
          <span>{locating ? 'Detecting GPS...' : 'Use My Current Location'}</span>
        </button>
      </div>

      <div className="relative h-64 w-full rounded-lg overflow-hidden border border-slate-300 shadow-inner">
        <MapContainer
          center={position}
          zoom={14}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={position}
            setPosition={setPosition}
            onLocationSelect={handleLocationSelect}
          />
        </MapContainer>

        {/* Map overlay hint */}
        <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] font-medium text-slate-700 shadow border border-slate-200 pointer-events-none">
          Click anywhere on map to drop pin
        </div>
      </div>

      {errorMsg && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <Info className="w-3.5 h-3.5" />
          {errorMsg}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded border border-slate-200">
        <div>
          <span className="font-semibold text-slate-700">Latitude:</span> {position[0].toFixed(5)}
        </div>
        <div>
          <span className="font-semibold text-slate-700">Longitude:</span> {position[1].toFixed(5)}
        </div>
        <div className="text-slate-400 text-[11px] ml-auto">
          GeoJSON standard [lng, lat]
        </div>
      </div>
    </div>
  );
};

export default MapPicker;
