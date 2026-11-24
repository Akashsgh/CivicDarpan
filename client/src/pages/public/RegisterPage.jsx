import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('citizen');
  const [departmentId, setDepartmentId] = useState('');
  const [designation, setDesignation] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If authority role is selected, load department list
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
        // Public endpoint might be protected, fetch fallback or handle gracefully
      }
    };

    if (role === 'authority') {
      fetchDepartments();
    }
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        phone,
        role,
        departmentId: role === 'authority' ? departmentId : null,
        designation: role === 'authority' ? designation : ''
      };

      const user = await register(payload);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'authority') navigate('/authority/dashboard');
      else navigate('/citizen/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-blue-600 items-center justify-center text-white shadow-md">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create an Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Join CivicLens to report, prioritize and monitor community resolutions.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200/90 shadow-sm space-y-5">
          
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Switcher */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registering As
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('citizen')}
                  className={`py-2 px-3 text-xs font-semibold rounded-md border text-center transition-all ${
                    role === 'citizen'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => setRole('authority')}
                  className={`py-2 px-3 text-xs font-semibold rounded-md border text-center transition-all ${
                    role === 'authority'
                      ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Authority Staff
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full text-xs rounded-md border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav@example.com"
                className="w-full text-xs rounded-md border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full text-xs rounded-md border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91-9876543210"
                className="w-full text-xs rounded-md border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Authority-specific fields */}
            {role === 'authority' && (
              <div className="p-3 bg-amber-50/70 rounded-md border border-amber-200 space-y-3">
                <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  Municipal Department Designation
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Department
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full text-xs rounded-md border border-slate-300 py-2 px-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select Department...</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Designation
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="Assistant Engineer, Sanitary Inspector..."
                    className="w-full text-xs rounded-md border border-slate-300 py-2 px-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-md shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Sign In
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
