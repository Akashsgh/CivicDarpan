import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { AlertTriangle, MapPin, Eye, Flame, Layers } from 'lucide-react';

// Color map per category for marker circles
const categoryColors = {
  'Potholes & Damaged Roads': '#ef4444', // Red
  'Garbage Accumulation & Sanitation': '#f59e0b', // Amber
  'Blocked Drainage & Waterlogging': '#3b82f6', // Blue
  'Broken Streetlights & Electrical': '#eab308', // Yellow
  'Water Leakage & Pipeline Issues': '#06b6d4', // Cyan
  'Damaged Footpaths & Public Infrastructure': '#8b5cf6', // Violet
  'default': '#64748b'
};

const HotspotMap = ({ complaints = [], hotspots = [], center = [28.6315, 77.2195], zoom = 12 }) => {
  const [showHotspotCircles, setShowHotspotCircles] = useState(true);
  const [showIndividualMarkers, setShowIndividualMarkers] = useState(true);

  return (
    <div className="relative w-full h-[540px] rounded-xl overflow-hidden border border-slate-300 shadow-sm">
      
      {/* Map Control Toggle Overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-sm p-2 rounded-lg border border-slate-200 shadow-md text-xs space-y-1.5">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-200">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>Map Layers</span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-slate-700">
          <input
            type="checkbox"
            checked={showHotspotCircles}
            onChange={(e) => setShowHotspotCircles(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
          />
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            Hotspot Cluster Zones ({hotspots.length})
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-slate-700">
          <input
            type="checkbox"
            checked={showIndividualMarkers}
            onChange={(e) => setShowIndividualMarkers(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
          />
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            Complaint Pins ({complaints.length})
          </span>
        </label>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm p-2.5 rounded-lg border border-slate-200 shadow-md text-[11px] max-w-xs hidden sm:block">
        <p className="font-bold text-slate-800 mb-1.5">Civic Hotspot Density</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/50 border border-red-600 inline-block" />
            <span className="text-slate-600">High Concentration (4+ issues or repeated hazards)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500/50 border border-amber-600 inline-block" />
            <span className="text-slate-600">Moderate Concentration (2-3 issues)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500/50 border border-blue-600 inline-block" />
            <span className="text-slate-600">Single Incident Spot</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Hotspot Circles */}
        {showHotspotCircles && hotspots.map((spot) => {
          const isHigh = spot.severityLevel === 'High';
          const isMed = spot.severityLevel === 'Medium';
          const color = isHigh ? '#ef4444' : (isMed ? '#f59e0b' : '#3b82f6');
          const radius = Math.min(650, 200 + (spot.count * 80));

          return (
            <Circle
              key={`circle-${spot.id}`}
              center={spot.center}
              radius={radius}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: isHigh ? 0.35 : 0.20,
                weight: isHigh ? 2.5 : 1.5
              }}
            >
              <Popup>
                <div className="p-1 space-y-2 min-w-[200px]">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-red-500" />
                      {spot.zoneName}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isHigh ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {spot.count} Issues
                    </span>
                  </div>

                  <div className="text-[11px] space-y-1 text-slate-600">
                    <p><span className="font-semibold text-slate-700">Top Issue:</span> {spot.topCategory}</p>
                    {spot.highPriorityCount > 0 && (
                      <p className="text-red-600 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {spot.highPriorityCount} High Priority Alert(s)
                      </p>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <p className="text-[10px] text-slate-500 font-medium">Clustered Complaints:</p>
                    <ul className="text-[10px] list-disc list-inside text-slate-700 max-h-24 overflow-y-auto">
                      {spot.complaints.map((c) => (
                        <li key={c.id}>
                          <Link to={`/complaints/${c.complaintId}`} className="text-blue-600 hover:underline">
                            {c.complaintId}: {c.title.slice(0, 32)}...
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {/* Individual Complaint Markers */}
        {showIndividualMarkers && complaints.map((c) => {
          if (!c.location || !Array.isArray(c.location.coordinates) || c.location.coordinates.length !== 2) {
            return null;
          }
          const [lng, lat] = c.location.coordinates;
          const markerColor = categoryColors[c.category] || categoryColors.default;

          // Custom SVG DivIcon with category color ring
          const customIcon = L.divIcon({
            className: 'custom-pin',
            html: `
              <div style="
                background-color: ${markerColor};
                width: 14px;
                height: 14px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 1px 4px rgba(0,0,0,0.4);
              "></div>
            `,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          });

          return (
            <Marker key={c._id || c.complaintId} position={[lat, lng]} icon={customIcon}>
              <Popup>
                <div className="p-1 space-y-2 min-w-[220px]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-700">{c.complaintId}</span>
                    <StatusBadge status={c.status} size="sm" />
                  </div>

                  <h4 className="font-semibold text-xs text-slate-800 leading-tight">
                    {c.title}
                  </h4>

                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {c.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                    <PriorityBadge priority={c.priority} size="sm" />
                    <Link
                      to={`/complaints/${c.complaintId}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default HotspotMap;
