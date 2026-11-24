import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import ResolutionModal from '../../components/ResolutionModal';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  Edit,
  Camera,
  Layers
} from 'lucide-react';

const ComplaintDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/complaints/${id}`);
      if (res.data.success) {
        setComplaint(res.data.complaint);
        setTimeline(res.data.timeline || []);
      }
    } catch (err) {
      console.error('Error fetching complaint details:', err);
      setError(err.response?.data?.message || 'Complaint not found or unauthorized access.');
    } finally {
      setLoading(false);
    }
  };

  const isStaffOrAdmin = user && (user.role === 'authority' || user.role === 'admin');

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        Loading complaint records and audit history...
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs">
          {error || 'Unable to retrieve complaint.'}
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Home
        </Link>
      </div>
    );
  }

  const coordinates = complaint.location?.coordinates || [77.2195, 28.6315];
  const [lng, lat] = coordinates;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <Link
            to={user?.role === 'authority' ? '/authority/assigned' : (user?.role === 'admin' ? '/admin/complaints' : '/citizen/my-complaints')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
              {complaint.complaintId}
            </span>
            <StatusBadge status={complaint.status} size="md" />
            <PriorityBadge priority={complaint.priority} size="md" />
          </div>
        </div>

        {/* Staff Update Action Button */}
        {isStaffOrAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all self-start sm:self-auto"
          >
            <Edit className="w-4 h-4" />
            <span>Update Workflow Status</span>
          </button>
        )}
      </div>

      {/* Duplicate Alert Banner if Flagged */}
      {complaint.isDuplicate && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>AI Potential Duplicate Notice</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            This complaint shares significant textual similarity ({(complaint.similarityScore * 100).toFixed(0)}%) and geographical proximity with a previously registered issue.
            {complaint.duplicateOf && (
              <> Matched with <Link to={`/complaints/${complaint.duplicateOf.complaintId}`} className="font-bold underline text-amber-900">{complaint.duplicateOf.complaintId}</Link>.</>
            )}
          </p>
        </div>
      )}

      {/* Main Grid: Details Left, Map & Evidence Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Problem Description & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Issue Overview Card */}
          <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 leading-snug">
              {complaint.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {complaint.description}
            </p>

            {/* Uploaded Photograph if Available */}
            {complaint.imageUrl && (
              <div className="pt-2">
                <span className="block text-xs font-semibold text-slate-500 mb-2">Citizen Uploaded Photograph:</span>
                <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={complaint.imageUrl}
                    alt="Citizen Issue"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Issue Metadata Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Civic Category</span>
                <span className="font-semibold text-slate-800">{complaint.category}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Assigned Division</span>
                <span className="font-semibold text-slate-800">{complaint.departmentId?.name || 'Pending Assignment'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Reported By</span>
                <span className="font-semibold text-slate-800">{complaint.citizenId?.name || 'Citizen'}</span>
              </div>
            </div>

            {/* AI Recommendation Explanation Card */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>AI Recommendation & Priority Rationale</span>
              </div>
              <p className="text-slate-600">
                <strong className="text-slate-800">Priority Rationale:</strong> {complaint.priorityReason}
              </p>
              {complaint.aiConfidence && (
                <p className="text-slate-500 text-[11px]">
                  Model classification confidence: {(complaint.aiConfidence * 100).toFixed(1)}% | Automated department suggestion: {complaint.aiSuggestedDepartment || 'General Works'}
                </p>
              )}
            </div>

          </div>

          {/* Resolution Evidence Box (If Resolved) */}
          {complaint.status === 'Resolved' && complaint.resolutionEvidence && (
            <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-sm text-emerald-900">Field Resolution Evidence</h3>
                </div>
                <span className="text-xs text-emerald-700 font-semibold">Verified Completed</span>
              </div>

              <p className="text-xs text-emerald-800 leading-relaxed">
                {complaint.resolutionEvidence.comment || 'Municipal field maintenance completed successfully.'}
              </p>

              {complaint.resolutionEvidence.imageUrl && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-emerald-900">Resolution Verification Photograph:</span>
                  <div className="h-56 w-full rounded-xl overflow-hidden border border-emerald-300 bg-white">
                    <img
                      src={complaint.resolutionEvidence.imageUrl}
                      alt="Resolution Evidence"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <p className="text-[11px] text-emerald-600">
                Signed off on {new Date(complaint.resolutionEvidence.resolvedAt || complaint.updatedAt).toLocaleString('en-IN')}
              </p>
            </div>
          )}

          {/* Rejection Notice (If Rejected) */}
          {complaint.status === 'Rejected' && (
            <div className="bg-rose-50 border border-rose-300 rounded-xl p-5 space-y-2 text-xs">
              <h3 className="font-bold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Complaint Rejected / Invalid</span>
              </h3>
              <p className="text-rose-800">
                <strong>Reason:</strong> {complaint.rejectionReason || 'Marked as outside municipal jurisdiction or duplicate.'}
              </p>
            </div>
          )}

          {/* Status Audit History Timeline */}
          <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Audit Trail & Workflow History</span>
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {timeline.map((event, idx) => (
                <div key={event._id || idx} className="relative space-y-1">
                  {/* Timeline dot */}
                  <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white" />

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={event.newStatus} size="sm" />
                      <span className="text-xs font-semibold text-slate-700">
                        by {event.updatedBy?.name || 'System'} ({event.updatedBy?.role || 'Authority'})
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(event.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {event.comment && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-100">
                      {event.comment}
                    </p>
                  )}

                  {event.evidenceImage && (
                    <div className="h-32 w-48 rounded-lg overflow-hidden border border-slate-200 mt-2">
                      <img src={event.evidenceImage} alt="Update proof" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): Location Map & Department Contact */}
        <div className="space-y-6">
          
          {/* Map Location Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Reported Location</span>
            </h3>

            <div className="h-56 w-full rounded-lg overflow-hidden border border-slate-200">
              <MapContainer
                center={[lat, lng]}
                zoom={14}
                scrollWheelZoom={false}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]}>
                  <Popup>
                    <div className="text-xs">
                      <strong>{complaint.complaintId}</strong>
                      <p>{complaint.location?.landmark || complaint.location?.address}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            <div className="text-xs text-slate-600 space-y-1 pt-1">
              {complaint.location?.address && (
                <p><span className="font-semibold text-slate-700">Address:</span> {complaint.location.address}</p>
              )}
              {complaint.location?.landmark && (
                <p><span className="font-semibold text-slate-700">Landmark:</span> {complaint.location.landmark}</p>
              )}
              <p><span className="font-semibold text-slate-700">City / Zone:</span> {complaint.location?.city || 'New Delhi'}</p>
              <p className="font-mono text-[11px] text-slate-400">
                Coordinates: {lat.toFixed(5)}, {lng.toFixed(5)}
              </p>
            </div>
          </div>

          {/* Department Contact Card */}
          {complaint.departmentId && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Responsible Department</span>
              </h3>
              <div className="space-y-1.5 text-slate-600">
                <p className="font-semibold text-slate-900 text-sm">{complaint.departmentId.name}</p>
                {complaint.departmentId.contactEmail && (
                  <p>Email: <a href={`mailto:${complaint.departmentId.contactEmail}`} className="text-blue-600 hover:underline">{complaint.departmentId.contactEmail}</a></p>
                )}
                {complaint.departmentId.contactPhone && (
                  <p>Helpline: <span className="font-semibold">{complaint.departmentId.contactPhone}</span></p>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Resolution Modal for Staff / Admin */}
      <ResolutionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        complaint={complaint}
        onUpdated={(updatedComplaint) => {
          setComplaint(updatedComplaint);
          fetchComplaint(); // refresh timeline
        }}
      />

    </div>
  );
};

export default ComplaintDetails;
