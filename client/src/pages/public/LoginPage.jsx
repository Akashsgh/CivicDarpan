import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, LogIn, AlertCircle, Sparkles, User, Building2, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    new URLSearchParams(location.search).get('expired') ? 'Your session expired. Please log in again.' : ''
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      redirectByRole(user.role);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'authority') navigate('/authority/dashboard');
    else navigate('/citizen/dashboard');
  };

  // Quick-fill credentials helper for evaluation viva
  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-blue-600 items-center justify-center text-white shadow-md">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign In to CivicLens
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Access citizen reporting, department resolution, or municipal admin tools.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200/90 shadow-sm space-y-6">
          
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs rounded-md border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs rounded-md border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-md shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Quick-fill Viva evaluation helper */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Quick-Fill Demo Credentials for Viva
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillCredentials('citizen@example.com', 'Citizen@123')}
                className="p-2 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-300 rounded border border-slate-200 transition-colors"
              >
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <User className="w-3 h-3 text-blue-600" /> Citizen
                </div>
                <div className="text-[10px] text-slate-500">citizen@example.com</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('officer.roads@civiclens.gov.in', 'Staff@123')}
                className="p-2 text-left bg-slate-50 hover:bg-amber-50 hover:border-amber-300 rounded border border-slate-200 transition-colors"
              >
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-amber-600" /> Roads Staff
                </div>
                <div className="text-[10px] text-slate-500">officer.roads@civiclens.gov.in</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('officer.sanitation@civiclens.gov.in', 'Staff@123')}
                className="p-2 text-left bg-slate-50 hover:bg-amber-50 hover:border-amber-300 rounded border border-slate-200 transition-colors"
              >
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-amber-600" /> Sanitation Staff
                </div>
                <div className="text-[10px] text-slate-500">officer.sanitation@civiclens.gov.in</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('admin@civiclens.gov.in', 'Admin@123')}
                className="p-2 text-left bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 rounded border border-slate-200 transition-colors"
              >
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Admin
                </div>
                <div className="text-[10px] text-slate-500">admin@civiclens.gov.in</div>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Register as Citizen
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default LoginPage;
