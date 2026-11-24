import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Search, UserPlus, ShieldAlert, CheckCircle2, XCircle, X } from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('authority');
  const [departmentId, setDepartmentId] = useState('');
  const [designation, setDesignation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let q = '?';
      if (roleFilter !== 'all') q += `role=${roleFilter}&`;
      if (search.trim()) q += `search=${encodeURIComponent(search.trim())}`;
      const res = await api.get(`/admin/users${q}`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/admin/departments');
      if (res.data.success) {
        setDepartments(res.data.departments);
        if (res.data.departments.length > 0) {
          setDepartmentId(res.data.departments[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const res = await api.patch(`/admin/users/${user._id}/status`, {
        isActive: !user.isActive
      });
      if (res.data.success) {
        setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: !u.isActive } : u));
      }
    } catch (err) {
      console.error('Error updating user status:', err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      const res = await api.post('/admin/users', {
        name,
        email,
        password,
        role,
        departmentId: role === 'authority' ? departmentId : null,
        designation
      });

      if (res.data.success) {
        fetchUsers();
        setModalOpen(false);
        setName('');
        setEmail('');
        setPassword('');
        setDesignation('');
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create user account');
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
            User Account Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Control access roles, assign authority personnel to departments, and manage accounts.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Account</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={(e) => { e.preventDefault(); fetchUsers(); }} className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or designation..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs rounded-md border border-slate-300 py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
        >
          <option value="all">All Roles</option>
          <option value="citizen">Citizens</option>
          <option value="authority">Authority Staff</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading user directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department / Designation</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{u.name}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : (u.role === 'authority' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700')
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{u.departmentId?.name || '—'}</p>
                      {u.designation && (
                        <p className="text-[11px] text-slate-400">{u.designation}</p>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        u.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                          u.isActive
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Add Official Account</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              {modalError && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded border border-red-200">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Officer Name"
                  className="w-full rounded border border-slate-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@civiclens.gov.in"
                  className="w-full rounded border border-slate-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded border border-slate-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded border border-slate-300 p-2 bg-white focus:outline-none"
                >
                  <option value="authority">Authority Staff</option>
                  <option value="admin">Administrator</option>
                  <option value="citizen">Citizen</option>
                </select>
              </div>

              {role === 'authority' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Assigned Department</label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full rounded border border-slate-300 p-2 bg-white focus:outline-none"
                    >
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Official Designation</label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Executive Engineer"
                      className="w-full rounded border border-slate-300 p-2 focus:outline-none"
                    />
                  </div>
                </>
              )}

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
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageUsers;
