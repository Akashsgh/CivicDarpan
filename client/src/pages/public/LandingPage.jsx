import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  Flame,
  Building2,
  FileCheck2,
  Cpu,
  Layers,
  Search
} from 'lucide-react';
import api from '../../services/api';

const categories = [
  { name: 'Potholes & Roads', desc: 'Asphalt cracks, craters & sinkholes', icon: '🚧', color: 'bg-red-50 text-red-700 border-red-200' },
  { name: 'Garbage & Sanitation', desc: 'Overflowing bins & illegal dumps', icon: '🗑️', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { name: 'Blocked Drainage', desc: 'Waterlogging & sewer backflow', icon: '🌊', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Broken Streetlights', desc: 'Dark stretches & exposed cables', icon: '💡', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { name: 'Water Pipe Leaks', desc: 'Burst mains & potable water loss', icon: '🚰', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { name: 'Damaged Footpaths', desc: 'Broken pavers & sidewalk hazards', icon: '🚶', color: 'bg-purple-50 text-purple-700 border-purple-200' },
];

const LandingPage = () => {
  const [stats, setStats] = useState({
    totalComplaints: 10,
    resolvedComplaints: 2,
    resolutionRate: 20,
    activeDepartments: 6
  });
  const [trackId, setTrackId] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/summary');
        if (res.data.success) {
          setStats(prev => ({
            ...prev,
            totalComplaints: res.data.summary.total,
            resolvedComplaints: res.data.summary.resolved,
            resolutionRate: res.data.summary.resolutionPercentage
          }));
        }
      } catch (err) {
        // Fallback to default preview stats
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 bg-blue-950/80 border border-blue-700/60 text-blue-300 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI-Driven Municipal Governance & Civic Accountability</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Report Civic Issues. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Track Real Resolution.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
            CivicLens connects citizens directly with municipal departments. Submit complaints with GPS locations and photographs, assisted by lightweight explainable AI categorization and real-time resolution evidence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to="/citizen/report"
              className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-lg shadow-lg hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Report a Problem Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Authority & Citizen Login</span>
            </Link>
          </div>

          {/* Quick Tracking Search Bar */}
          <div className="pt-6 max-w-md mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (trackId.trim()) {
                  window.location.href = `/complaints/${trackId.trim()}`;
                }
              }}
              className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 p-1.5 rounded-lg shadow-md"
            >
              <Search className="w-4 h-4 text-slate-400 ml-2" />
              <input
                type="text"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="Track complaint by ID (e.g. CIV-2026-0001)..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none px-2"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
              >
                Track
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* Live Impact Stats Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-24 relative z-20">
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-md">
            <p className="text-xs font-semibold uppercase text-slate-500">Total Logged Issues</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalComplaints}</p>
            <p className="text-[11px] text-slate-400 mt-1">Single-city municipal deployment</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-md">
            <p className="text-xs font-semibold uppercase text-emerald-600">Verified Resolutions</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">{stats.resolvedComplaints}</p>
            <p className="text-[11px] text-slate-400 mt-1">With photo evidence on record</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-md">
            <p className="text-xs font-semibold uppercase text-blue-600">Resolution Rate</p>
            <p className="text-3xl font-extrabold text-blue-600 mt-1">{stats.resolutionRate}%</p>
            <p className="text-[11px] text-slate-400 mt-1">Target turnaround &lt; 72 hrs</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-md">
            <p className="text-xs font-semibold uppercase text-slate-500">Connected Divisions</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.activeDepartments}</p>
            <p className="text-[11px] text-slate-400 mt-1">Roads, Sanitation, Water, Power...</p>
          </div>
        </div>
      </section>

      {/* Common Issue Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Supported Civic Grievance Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Citizens can report any of the core municipal infrastructure problems below.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="p-5 bg-white rounded-xl border border-slate-200/90 hover:border-blue-400 hover:shadow-sm transition-all flex items-start gap-3"
            >
              <div className="text-2xl p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                {cat.icon}
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-slate-900">{cat.name}</h3>
                <p className="text-xs text-slate-500">{cat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Architecture Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs uppercase font-bold text-blue-600 tracking-wider">Workflow Engineering</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How CivicLens Resolves Civic Grievances
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            A transparent four-step pipeline from citizen submission to on-site municipal sign-off.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3 relative">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h4 className="font-bold text-sm text-slate-900">Citizen Submission</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Citizen captures issue photo, enters description, and drops a precise location pin on the interactive Leaflet map.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3 relative">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h4 className="font-bold text-sm text-slate-900">AI ML Intelligence</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Python FastAPI service classifies issue with TF-IDF, checks nearby duplicates within 1km, and scores priority.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3 relative">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h4 className="font-bold text-sm text-slate-900">Authority Dispatch</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Zonal officers review complaints on their dashboard and hotspot map, dispatch maintenance crews, and update status.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3 relative">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              4
            </span>
            <h4 className="font-bold text-sm text-slate-900">Resolution Verification</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Staff uploads photo evidence after repair. Citizen tracks audit timeline and views before/after resolution evidence.
            </p>
          </div>

        </div>
      </section>

      {/* Role Navigation CTAs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-2xl p-8 sm:p-12 text-white border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">For Citizens</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Log potholes, broken lights, and water leaks. Track live status changes and receive resolution proof.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                Register as Citizen <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">For Department Staff</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Access assigned department complaints, inspect AI confidence recommendations, and record resolution proof.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300"
              >
                Staff Portal Login <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">For Municipal Admins</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Review city-wide hotspot analytics, oversee departments, manage user accounts, and resolve bottlenecks.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Admin Console <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
