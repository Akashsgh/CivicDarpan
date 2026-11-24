import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ComplaintCard from '../../components/ComplaintCard';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  Sparkles,
  MapPin
} from 'lucide-react';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, resolved

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/complaints?limit=20');
        if (res.data.success) {
          setComplaints(res.data.complaints);
        }
      } catch (err) {
        console.error('Error fetching complaints:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const inProgress = complaints.filter(c => ['Under Review', 'Assigned', 'In Progress'].includes(c.status)).length;
  const highPriority = complaints.filter(c => c.priority === 'High' && c.status !== 'Resolved').length;

  const filteredComplaints = complaints.filter(c => {
    if (filter === 'resolved') return c.status === 'Resolved';
    if (filter === 'active') return c.status !== 'Resolved' && c.status !== 'Rejected';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md border border-slate-700">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-400">Citizen Grievance Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Citizen'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Submit civic grievances, inspect AI-recommended routing, and track field resolution proof.
          </p>
        </div>

        <Link
          to="/citizen/report"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-lg shadow-md transition-all self-start sm:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Civic Issue</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">My Reports</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{total}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <FolderOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-indigo-600">Active / In Progress</p>
            <p className="text-2xl font-extrabold text-indigo-700 mt-0.5">{inProgress}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-emerald-600">Resolved</p>
            <p className="text-2xl font-extrabold text-emerald-700 mt-0.5">{resolved}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-red-600">High Urgency</p>
            <p className="text-2xl font-extrabold text-red-700 mt-0.5">{highPriority}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Complaints List Section */}
      <div className="space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Reported Issues</h2>
            <p className="text-xs text-slate-500">Live progress tracking and municipal updates</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg self-start">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({total})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                filter === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({inProgress})
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                filter === 'resolved' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resolved ({resolved})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading complaints...</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">No complaints reported yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Notice a pothole, open garbage dump or broken streetlight? Report it right now with a photo and map pin.
            </p>
            <Link
              to="/citizen/report"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md transition-all shadow"
            >
              Report First Grievance
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredComplaints.map((complaint) => (
              <ComplaintCard key={complaint._id} complaint={complaint} />
            ))}
          </div>
        )}

      </div>

    </div>
  );
};

export default CitizenDashboard;
