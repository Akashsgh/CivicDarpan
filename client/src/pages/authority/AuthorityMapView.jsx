import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import { MapPin, Eye, Filter } from 'lucide-react';

const AuthorityMapView = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');

  useEffect(() => {
    fetchComplaints();
  }, [status]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let q = '?limit=100';
      if (status !== 'all') q += `&status=${status}`;
      const res = await api.get(`/complaints${q}`);
      if (res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      console.error('Error fetching map complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Jurisdiction Geographic Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Geographical dispersion of issues assigned to your department.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs rounded-md border border-slate-300 py-1.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Workflow Statuses</option>
            <option value="Submitted">Submitted (New)</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="relative h-[600px] w-full rounded-2xl overflow-hidden border border-slate-300 shadow-sm">
        {loading ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading map pins...</div>
        ) : (
          <MapContainer
            center={[28.6315, 77.2195]}
            zoom={12}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {complaints.map((c) => {
              if (!c.location || !Array.isArray(c.location.coordinates) || c.location.coordinates.length !== 2) return null;
              const [lng, lat] = c.location.coordinates;

              return (
                <Marker key={c._id} position={[lat, lng]}>
                  <Popup>
                    <div className="p-1 space-y-2 min-w-[200px]">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-blue-700">{c.complaintId}</span>
                        <StatusBadge status={c.status} size="sm" />
                      </div>
                      <h4 className="font-semibold text-xs text-slate-800">{c.title}</h4>
                      <p className="text-[11px] text-slate-500">{c.location?.landmark || c.location?.address}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <PriorityBadge priority={c.priority} size="sm" />
                        <Link
                          to={`/complaints/${c.complaintId}`}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>

    </div>
  );
};

export default AuthorityMapView;
