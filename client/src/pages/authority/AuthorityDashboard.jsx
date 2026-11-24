import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import ResolutionModal from '../../components/ResolutionModal';
import {
  Building2,
  FolderOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Eye,
  Edit,
  ArrowRight,
  Filter,
  Sparkles
} from 'lucide-react';

const AuthorityDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDepartmentComplaints();
  }, [statusFilter]);

  const fetchDepartmentComplaints = async () => {
    setLoading(true);
    try {
      let query = `?limit=50`;
      if (statusFilter !== 'all') query += `&status=${statusFilter}`;
      const res = await api.get(`/complaints${query}`);
      if (res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      console.error('Error fetching authority complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const total = complaints.length;
  const inProgress = complaints.filter(c => ['Assigned', 'In Progress'].includes(c.status)).length;
  const underReview = complaints.filter(c => ['Submitted', 'Under Review'].includes(c.status)).length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const highPriority = complaints.filter(c => c.priority === 'High' && c.status !== 'Resolved').length;

  const handleOpenUpdate = (complaint) => {
    setSelectedComplaint(complaint);
    setModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Authority Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-2xl p-6 sm:p-8 text-white border border-slate-700 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
              Department Operations Portal
            </span>
            <span className="text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-700/60 px-2 py-0.5 rounded">
              {user?.department?.name || 'Municipal Works Division'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {user?.name || 'Department Officer'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {user?.designation || 'Field Executive Engineer'} • Municipal Grievance Dispatch & Resolution Console
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/authority/map"
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
          >
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Jurisdiction Map</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Total Workload</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{total}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <FolderOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-amber-600">Pending Review</p>
            <p className="text-2xl font-extrabold text-amber-700 mt-0.5">{underReview}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-indigo-600">In Progress</p>
            <p className="text-2xl font-extrabold text-indigo-700 mt-0.5">{inProgress}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-red-600">High Priority Action</p>
            <p className="text-2xl font-extrabold text-red-700 mt-0.5">{highPriority}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Assigned Issues Table */}
      <div className="space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Assigned Department Complaints</h2>
            <p className="text-xs text-slate-500">Inspect AI recommendations, duplicate flags and update progress</p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('Submitted')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                statusFilter === 'Submitted' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New
            </button>
            <button
              onClick={() => setStatusFilter('In Progress')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                statusFilter === 'In Progress' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter('Resolved')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                statusFilter === 'Resolved' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading department issues...</div>
          ) : complaints.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No complaints matching filter</p>
              <p className="text-xs text-slate-400">All assigned issues for this status have been addressed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Complaint ID</th>
                    <th className="py-3 px-4">Issue Details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Priority & AI</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Reported</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {c.complaintId}
                        {c.isDuplicate && (
                          <span className="block text-[10px] text-amber-600 font-sans font-semibold">
                            ⚠️ Duplicate Flag
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-semibold text-slate-800 truncate">{c.title}</p>
                        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{c.location?.landmark || c.location?.address || 'Location on map'}</span>
                        </p>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                          {c.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap space-y-1">
                        <PriorityBadge priority={c.priority} size="sm" />
                        {c.aiConfidence && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                            <span>{(c.aiConfidence * 100).toFixed(0)}% Conf</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={c.status} size="sm" />
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleOpenUpdate(c)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 px-2.5 py-1 rounded transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Update</span>
                        </button>
                        <Link
                          to={`/complaints/${c.complaintId}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Resolution & Status Update Modal */}
      <ResolutionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        complaint={selectedComplaint}
        onUpdated={(updated) => {
          setComplaints(prev => prev.map(c => c._id === updated._id ? updated : c));
        }}
      />

    </div>
  );
};

export default AuthorityDashboard;
