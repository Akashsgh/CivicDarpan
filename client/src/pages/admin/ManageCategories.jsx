import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Layers, PlusCircle, Building2, CheckCircle2, X } from 'lucide-react';
import PriorityBadge from '../../components/PriorityBadge';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [defaultDepartmentId, setDefaultDepartmentId] = useState('');
  const [defaultPriority, setDefaultPriority] = useState('Medium');
  const [severityBaseScore, setSeverityBaseScore] = useState(6);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, deptRes] = await Promise.all([
        api.get('/admin/categories'),
        api.get('/admin/departments')
      ]);

      if (catRes.data.success) setCategories(catRes.data.categories);
      if (deptRes.data.success) {
        setDepartments(deptRes.data.departments);
        if (deptRes.data.departments.length > 0) {
          setDefaultDepartmentId(deptRes.data.departments[0]._id);
        }
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/admin/categories', {
        name,
        code,
        description,
        defaultDepartmentId,
        defaultPriority,
        severityBaseScore: parseInt(severityBaseScore)
      });

      if (res.data.success) {
        fetchData();
        setModalOpen(false);
        setName('');
        setCode('');
        setDescription('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
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
            Civic Grievance Categories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Define issue types, default municipal departments, and ML severity baselines.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading categories...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Default Department</th>
                  <th className="py-3 px-4">Default Priority</th>
                  <th className="py-3 px-4">Base Severity</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {cat.code}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{cat.name}</p>
                      {cat.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-1">{cat.description}</p>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">
                        {cat.defaultDepartmentId?.name || 'Unassigned'}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <PriorityBadge priority={cat.defaultPriority} size="sm" />
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {cat.severityBaseScore || 5}/10
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Add Issue Category</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Broken Footpaths"
                  className="w-full rounded border border-slate-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FOOTPATH"
                  className="w-full rounded border border-slate-300 p-2 uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Department</label>
                <select
                  value={defaultDepartmentId}
                  onChange={(e) => setDefaultDepartmentId(e.target.value)}
                  className="w-full rounded border border-slate-300 p-2 bg-white focus:outline-none"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Default Priority</label>
                  <select
                    value={defaultPriority}
                    onChange={(e) => setDefaultPriority(e.target.value)}
                    className="w-full rounded border border-slate-300 p-2 bg-white focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Severity Base (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={severityBaseScore}
                    onChange={(e) => setSeverityBaseScore(e.target.value)}
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
                  {submitting ? 'Saving...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageCategories;
