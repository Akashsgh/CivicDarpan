import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import { Search, Filter, Eye, ArrowRight, MapPin, Sparkles, AlertCircle, RefreshCw, X } from 'lucide-react';

const AllComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [departmentId, setDepartmentId] = useState('all');

  // Reassignment Modal State
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [targetComplaint, setTargetComplaint] = useState(null);
  const [newDepartmentId, setNewDepartmentId] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [reassignComment, setReassignComment] = useState('');
  const [reassigning, setReassigning] = useState(false);

  useEffect(() => {
    fetchComplaints();
    fetchDepartments();
  }, [status, priority, departmentId]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let q = '?limit=100';
      if (status !== 'all') q += `&status=${status}`;
      if (priority !== 'all') q += `&priority=${priority}`;
      if (departmentId !== 'all') q += `&departmentId=${departmentId}`;
      if (search.trim()) q += `&search=${encodeURIComponent(search.trim())}`;

      const res = await api.get(`/complaints${q}`);
      if (res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      console.error('Error fetching all complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/admin/departments');
      if (res.data.success) setDepartments(res.data.departments);
    } catch (err) {
      console.error('Error loading departments:', err);
    }
  };

  const handleOpenReassign = (c) => {
    setTargetComplaint(c);
    setNewDepartmentId(c.departmentId?._id || '');
    setNewPriority(c.priority || 'Medium');
    setReassignComment('');
    setReassignModalOpen(true);
  };

  const handleSaveReassign = async (e) => {
    e.preventDefault();
    setReassigning(true);
    try {
      const res = await api.patch(`/admin/complaints/${targetComplaint._id}/reassign`, {
        departmentId: newDepartmentId,
        priority: newPriority,
        comment: reassignComment || 'Department reassignment by municipal administrator.'
      });
      if (res.data.success) {
        fetchComplaints();
        setReassignModalOpen(false);
      }
    } catch (err) {
      console.error('Error reassigning complaint:', err);
    } finally {
      setReassigning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Master Municipal Complaints Registry
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          City-wide oversight: inspect complaints, override priorities and reassign departments.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={(e) => { e.preventDefault(); fetchComplaints(); }} className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, keyword, citizen, landmark..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="text-xs rounded-md border border-slate-300 py-2 px-3 bg-white focus:outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs rounded-md border border-slate-300 py-2 px-3 bg-white focus:outline-none"
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
            className="text-xs rounded-md border border-slate-300 py-2 px-3 bg-white focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No complaints matching filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Complaint ID</th>
                  <th className="py-3 px-4">Title & Citizen</th>
                  <th className="py-3 px-4">Department</th>
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
                          ⚠️ Duplicate
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-slate-900 truncate">{c.title}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        By {c.citizenId?.name || 'Citizen'} • {c.location?.landmark || c.location?.address}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">
                        {c.departmentId?.name || 'Unassigned'}
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

                    <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleOpenReassign(c)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reassign</span>
                      </button>
                      <Link
                        to={`/complaints/${c.complaintId}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
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

      {/* Reassign Modal */}
      {reassignModalOpen && targetComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                Reassign: <span className="font-mono text-blue-700">{targetComplaint.complaintId}</span>
              </h3>
              <button onClick={() => setReassignModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReassign} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign to Department</label>
                <select
                  value={newDepartmentId}
                  onChange={(e) => setNewDepartmentId(e.target.value)}
                  className="w-full rounded border border-slate-300 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department...</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Override Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full rounded border border-slate-300 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Administrative Note</label>
                <textarea
                  rows={2}
                  value={reassignComment}
                  onChange={(e) => setReassignComment(e.target.value)}
                  placeholder="Reason for reassignment or escalation..."
                  className="w-full rounded border border-slate-300 p-2 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReassignModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reassigning}
                  className="px-5 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded disabled:opacity-50"
                >
                  {reassigning ? 'Reassigning...' : 'Confirm Reassignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AllComplaints;
