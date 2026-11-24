import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import HotspotMap from '../../components/HotspotMap';
import {
  Flame,
  Filter,
  MapPin,
  AlertTriangle,
  Layers,
  Calendar,
  Sparkles,
  BarChart3,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const CATEGORIES = [
  'Potholes & Damaged Roads',
  'Garbage Accumulation & Sanitation',
  'Blocked Drainage & Waterlogging',
  'Broken Streetlights & Electrical',
  'Water Leakage & Pipeline Issues',
  'Damaged Footpaths & Public Infrastructure'
];

const HotspotAnalytics = () => {
  const [complaints, setComplaints] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [days, setDays] = useState('all');

  useEffect(() => {
    fetchHotspots();
  }, [category, status, priority, days]);

  const fetchHotspots = async () => {
    setLoading(true);
    try {
      let q = '?';
      if (category !== 'all') q += `category=${encodeURIComponent(category)}&`;
      if (status !== 'all') q += `status=${status}&`;
      if (priority !== 'all') q += `priority=${priority}&`;
      if (days !== 'all') q += `days=${days}&`;

      const res = await api.get(`/analytics/hotspots${q}`);
      if (res.data.success) {
        setComplaints(res.data.complaints || []);
        setHotspots(res.data.hotspots || []);
      }
    } catch (err) {
      console.error('Error fetching hotspot analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const highSeverityHotspots = hotspots.filter(h => h.severityLevel === 'High').length;

  // Chart data from current filtered complaints
  const catCountMap = {};
  complaints.forEach(c => {
    catCountMap[c.category] = (catCountMap[c.category] || 0) + 1;
  });
  const chartData = Object.entries(catCountMap).map(([cat, count]) => ({
    name: cat.split(' ')[0], // short label
    fullName: cat,
    count
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-2xl p-6 sm:p-8 text-white border border-slate-700 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-red-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> Special Engineering Feature
            </span>
            <span className="text-[10px] font-mono bg-red-950 text-red-300 border border-red-700/60 px-2 py-0.5 rounded">
              Spatial Geospatial Aggregation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Civic Hotspot Density Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Identify chronic recurring civic failures, spatial clustering of potholes, and municipal neglect hotspots.
          </p>
        </div>

        <button
          onClick={fetchHotspots}
          className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3.5 py-2 rounded-lg text-xs font-semibold self-start sm:self-auto transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Map</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Geotagged Issues</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{complaints.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Complaints with GPS coordinates</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold uppercase text-red-600">Identified Hotspots</p>
          <p className="text-2xl font-extrabold text-red-600 mt-0.5">{hotspots.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Clustered spatial zones</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold uppercase text-amber-600">Critical Failure Zones</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-0.5">{highSeverityHotspots}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Concentrated repeated issues</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold uppercase text-blue-600">Top Problem Type</p>
          <p className="text-sm font-bold text-slate-800 mt-1 truncate">
            {chartData[0]?.fullName || 'Potholes & Roads'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {chartData[0]?.count || 0} occurrences in active filter
          </p>
        </div>

      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Hotspot Map Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-xs rounded-md border border-slate-300 py-1.5 px-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Issue Categories</option>
            {CATEGORIES.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs rounded-md border border-slate-300 py-1.5 px-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Workflow Statuses</option>
            <option value="Submitted">Submitted (Pending)</option>
            <option value="Under Review">Under Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Priority */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="text-xs rounded-md border border-slate-300 py-1.5 px-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="High">High Urgency</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Time Window */}
          <select
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="text-xs rounded-md border border-slate-300 py-1.5 px-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Historical Time</option>
            <option value="7">Last 7 Days</option>
            <option value="15">Last 15 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Interactive Map Component */}
      <HotspotMap
        complaints={complaints}
        hotspots={hotspots}
        center={[28.6315, 77.2195]}
        zoom={12}
      />

      {/* Breakdown Section: Ranked Hotspot Zones & Category Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ranked Hotspot Zones List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-500" />
                <span>Ranked Civic Hotspot Zones</span>
              </h3>
              <p className="text-xs text-slate-400">Areas with highest frequency of repeated citizen complaints</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{hotspots.length} Clusters</span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {hotspots.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No hotspot clusters in current filter view.</p>
            ) : (
              hotspots.map((spot, idx) => (
                <div
                  key={spot.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        #{idx + 1} {spot.zoneName}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        spot.severityLevel === 'High'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {spot.severityLevel} Density
                      </span>
                    </div>

                    <p className="text-slate-500">
                      Dominant Category: <strong className="text-slate-700">{spot.topCategory}</strong>
                    </p>

                    {spot.highPriorityCount > 0 && (
                      <p className="text-red-600 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {spot.highPriorityCount} High Urgency Alert(s)
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-2xl font-extrabold text-blue-700">
                      {spot.count}
                    </div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                      Complaints Logged
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Breakdown in Filter */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Grievance Distribution</span>
            </h3>
            <p className="text-xs text-slate-400">Issue counts for current selection</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={70} />
                <Tooltip
                  formatter={(val, name, props) => [val, props.payload.fullName]}
                  contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

export default HotspotAnalytics;
