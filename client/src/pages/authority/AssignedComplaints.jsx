import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import ResolutionModal from '../../components/ResolutionModal';
import { Search, Filter, Eye, Edit, MapPin, Sparkles, AlertCircle } from 'lucide-react';

const AssignedComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, [status, priority]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let query = `?limit=100`;
      if (status !== 'all') query += `&status=${status}`;
      if (priority !== 'all') query += `&priority=${priority}`;
      if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;

      const res = await api.get(`/complaints${query}`);
      if (res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      console.error('Error fetching assigned complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Department Assigned Complaints
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Review complaints in your jurisdiction, verify AI classifications and log progress.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, keywords, road or landmark..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs rounded-md border border-slate-300 py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="text-xs rounded-md border border-slate-300 py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
          >
            <option value="all">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No complaints matching current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Complaint ID</th>
                  <th className="py-3 px-4">Title & Citizen</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority & AI</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
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
                          ⚠️ Potential Duplicate
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-slate-800 truncate">{c.title}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        Citizen: {c.citizenId?.name || 'Anonymous'} • {c.location?.landmark || c.location?.address || 'Location on map'}
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
                        onClick={() => {
                          setSelectedComplaint(c);
                          setModalOpen(true);
                        }}
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
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

export default AssignedComplaints;
