import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  ShieldAlert,
  Users,
  Building2,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Flame,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return <div className="p-16 text-center text-xs text-slate-400">Loading administrative statistics...</div>;
  }

  const stats = data?.stats || {};
  const categoryStats = (data?.categoryStats || []).map(item => ({
    name: item._id?.replace('&', '\n') || 'Other',
    fullName: item._id,
    count: item.count
  }));

  const priorityStats = (data?.priorityStats || []).map(item => ({
    name: item._id,
    value: item.count
  }));

  const departmentStats = (data?.departmentStats || []).map(item => ({
    name: item.name,
    count: item.count
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md border border-slate-700">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-400">Executive Console</span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700/60">
              City Administration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Municipal Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time grievance metrics, departmental performance, and hotspot monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/hotspots"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all"
          >
            <Flame className="w-4 h-4" />
            <span>Civic Hotspots</span>
          </Link>
          <Link
            to="/admin/complaints"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all"
          >
            <FolderOpen className="w-4 h-4" />
            <span>All Complaints</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-semibold uppercase text-slate-500">Total Grievances</p>
          <p className="text-3xl font-extrabold text-slate-900">{stats.totalComplaints || 0}</p>
          <p className="text-[11px] text-slate-400">Single-city municipal database</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-semibold uppercase text-emerald-600">Resolution Rate</p>
          <p className="text-3xl font-extrabold text-emerald-600">{stats.resolutionRate || 0}%</p>
          <p className="text-[11px] text-slate-400">{stats.resolvedComplaints || 0} issues resolved with proof</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-semibold uppercase text-amber-600">In Active Pipeline</p>
          <p className="text-3xl font-extrabold text-amber-600">
            {(stats.inProgressComplaints || 0) + (stats.underReviewComplaints || 0) + (stats.assignedComplaints || 0)}
          </p>
          <p className="text-[11px] text-slate-400">Assigned across field crews</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-semibold uppercase text-red-600">Urgent Pending</p>
          <p className="text-3xl font-extrabold text-red-600">{stats.highPriorityPending || 0}</p>
          <p className="text-[11px] text-red-500 font-medium">Overdue SLA: {stats.overdueComplaints || 0} issues</p>
        </div>

      </div>

      {/* Stakeholder Registry Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/admin/users?role=citizen" className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Registered Citizens</p>
            <p className="text-xl font-bold text-slate-900">{stats.totalCitizens || 0}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </Link>

        <Link to="/admin/users?role=authority" className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-sm transition-all flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Department Field Officers</p>
            <p className="text-xl font-bold text-slate-900">{stats.totalStaff || 0}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </Link>

        <Link to="/admin/departments" className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-sm transition-all flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Active Municipal Divisions</p>
            <p className="text-xl font-bold text-slate-900">{stats.totalDepartments || 0}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </Link>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Complaints by Civic Category</h3>
              <p className="text-xs text-slate-400">Total volume reported per infrastructure division</p>
            </div>
            <Link to="/admin/complaints" className="text-xs text-blue-600 font-semibold hover:underline">
              View All
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val, name, props) => [val, props.payload.fullName]}
                  contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown Donut Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Priority Tiers</h3>
            <p className="text-xs text-slate-400">Severity score distribution</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {priorityStats.map((entry, index) => {
                    const color = entry.name === 'High' ? '#ef4444' : (entry.name === 'Medium' ? '#f59e0b' : '#10b981');
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              <span>High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Low</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
