import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  PlusCircle,
  LayoutDashboard,
  FileText,
  MapPin,
  Users,
  Building2,
  LogOut,
  Menu,
  X,
  Compass,
  CheckCircle,
  SlidersHorizontal
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Portal Branding */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-500 transition-colors">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">CivicLens</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Municipal AI
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Public Grievance & Resolution Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                isActive('/') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                isActive('/about') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              About & Architecture
            </Link>
            
            {/* Authenticated Role Navigation */}
            {isAuthenticated && user?.role === 'citizen' && (
              <>
                <Link
                  to="/citizen/dashboard"
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive('/citizen/dashboard') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/citizen/my-complaints"
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive('/citizen/my-complaints') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  My Complaints
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'authority' && (
              <>
                <Link
                  to="/authority/dashboard"
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive('/authority/dashboard') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Staff Portal
                </Link>
                <Link
                  to="/authority/assigned"
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive('/authority/assigned') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Assigned Issues
                </Link>
                <Link
                  to="/authority/map"
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive('/authority/map') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Jurisdiction Map
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive('/admin/dashboard') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Admin Portal
                </Link>
                <Link
                  to="/admin/complaints"
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive('/admin/complaints') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  All Complaints
                </Link>
                <Link
                  to="/admin/hotspots"
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive('/admin/hotspots') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Hotspot Analytics
                </Link>
                <Link
                  to="/admin/departments"
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive('/admin/departments') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Departments
                </Link>
              </>
            )}
          </nav>

          {/* Right Action / Profile Button */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Submit Issue CTA button for citizens */}
                {user?.role === 'citizen' && (
                  <Link
                    to="/citizen/report"
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-md shadow-sm transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Report Civic Issue</span>
                  </Link>
                )}

                {/* User Info Capsule */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
                    <span className="inline-block text-[10px] font-medium uppercase tracking-wide text-blue-400">
                      {user.role} {user.department ? `(${user.department.code})` : ''}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-md hover:bg-slate-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-md shadow-sm transition-all"
                >
                  Citizen Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
          >
            About & Architecture
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === 'citizen' && (
                <>
                  <Link
                    to="/citizen/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    Citizen Dashboard
                  </Link>
                  <Link
                    to="/citizen/report"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-blue-400 hover:bg-slate-800"
                  >
                    + Report Civic Issue
                  </Link>
                  <Link
                    to="/citizen/my-complaints"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    My Complaints
                  </Link>
                </>
              )}
              {user?.role === 'authority' && (
                <>
                  <Link
                    to="/authority/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    Staff Portal
                  </Link>
                  <Link
                    to="/authority/assigned"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    Assigned Issues
                  </Link>
                  <Link
                    to="/authority/map"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    Jurisdiction Map
                  </Link>
                </>
              )}
              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    Admin Portal
                  </Link>
                  <Link
                    to="/admin/complaints"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    All Complaints
                  </Link>
                  <Link
                    to="/admin/hotspots"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    Hotspot Analytics
                  </Link>
                </>
              )}

              <div className="pt-3 border-t border-slate-800">
                <div className="px-3 py-1">
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-blue-400 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-slate-800 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 rounded-md text-sm font-medium text-slate-200 bg-slate-800"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600"
              >
                Register Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
