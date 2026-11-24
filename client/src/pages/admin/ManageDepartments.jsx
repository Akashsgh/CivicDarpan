import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Building2, PlusCircle, Users, FolderOpen, Mail, Phone, X } from 'lucide-react';

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [supportedCategories, setSupportedCategories] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/departments');
      if (res.data.success) {
        setDepartments(res.data.departments);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/admin/departments', {
        name,
        code,
        description,
        supportedCategories: supportedCategories.split(',').map(s => s.trim()).filter(Boolean),
        contactEmail,
        contactPhone
      });

      if (res.data.success) {
        fetchDepartments();
        setModalOpen(false);
        setName('');
        setCode('');
        setDescription('');
        setSupportedCategories('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create department');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Municipal Department Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure civic divisions, supported grievance categories, and supervisory staff.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Grid of Departments */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading departments...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="bg-white p-6 rounded-xl border border-slate-200/90 hover:border-blue-300 shadow-sm transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                    {dept.code}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900">
                  {dept.name}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {dept.description || 'Municipal civic maintenance and infrastructure division.'}
                </p>

                {/* Supported Categories list */}
                {dept.supportedCategories?.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-semibold text-slate-400 block">Jurisdiction Categories:</span>
                    <div className="flex flex-wrap gap-1">
                      {dept.supportedCategories.map((cat, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Stats & Contacts Footer */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <strong>{dept.staffCount || 0}</strong> Staff
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                    <strong>{dept.pendingComplaints || 0}</strong> Pending
                  </span>
                </div>

                {(dept.contactEmail || dept.contactPhone) && (
                  <div className="text-[11px] text-slate-500 pt-1 space-y-0.5">
                    {dept.contactEmail && (
                      <p className="flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{dept.contactEmail}</span>
                      </p>
                    )}
                    {dept.contactPhone && (
                      <p className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{dept.contactPhone}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Create Department Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Add Municipal Department</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Roads & Infrastructure"
                  className="w-full rounded border border-slate-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. RND"
                  className="w-full rounded border border-slate-300 p-2 uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Responsibilities and mandate..."
                  className="w-full rounded border border-slate-300 p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supported Categories (comma separated)</label>
                <input
                  type="text"
                  value={supportedCategories}
                  onChange={(e) => setSupportedCategories(e.target.value)}
                  placeholder="Potholes, Damaged Roads"
                  className="w-full rounded border border-slate-300 p-2 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="dept@civiclens.gov.in"
                    className="w-full rounded border border-slate-300 p-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Helpline Phone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91-11-23456701"
                    className="w-full rounded border border-slate-300 p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageDepartments;
