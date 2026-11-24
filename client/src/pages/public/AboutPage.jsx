import React from 'react';
import {
  Cpu,
  Database,
  Layers,
  ShieldCheck,
  Flame,
  CheckCircle2,
  FileCode2,
  BookOpen,
  GitBranch,
  Activity
} from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="space-y-3 text-center max-w-3xl mx-auto">
        <span className="text-xs uppercase font-bold text-blue-600 tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Academic B.Tech Major Project Specification
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About CivicLens & Architecture Overview
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          CivicLens is an AI-powered civic issue reporting, intelligent prioritization, duplicate detection, and resolution tracking platform designed for modern municipal corporations.
        </p>
      </div>

      {/* Project Objectives */}
      <section className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <span>Project Objectives & Problem Statement</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Traditional municipal grievance portals suffer from severe bottlenecks: citizens submit vague complaints without verifiable coordinates, municipal departments operate in silos, duplicate complaints for identical road craters overwhelm staff, and citizens never receive photographic confirmation of repairs.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <h4 className="text-xs font-bold text-slate-800">1. Centralized Citizen Access</h4>
            <p className="text-xs text-slate-500">
              Single-window interface with GPS map pin dropping, photo uploads, and real-time status tracking from submission to resolution.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <h4 className="text-xs font-bold text-slate-800">2. Explainable AI Classification</h4>
            <p className="text-xs text-slate-500">
              TF-IDF text vectorization and Scikit-learn classification to predict issue categories and route to corresponding municipal departments.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <h4 className="text-xs font-bold text-slate-800">3. Duplicate Complaint Detection</h4>
            <p className="text-xs text-slate-500">
              Cosine similarity combined with Haversine geographical distance (&lt; 1km) to detect clustered repeat reports without auto-deleting.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <h4 className="text-xs font-bold text-slate-800">4. Civic Hotspot Density Analysis</h4>
            <p className="text-xs text-slate-500">
              MongoDB 2dsphere geospatial clustering and Leaflet OpenStreetMap visualization to highlight chronic recurring failure zones.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Stack Architecture */}
      <section className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <span>System Architecture & Technology Stack</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <FileCode2 className="w-4 h-4" />
              <span>Frontend Layer</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li><strong className="text-slate-800">React.js 18</strong> with Vite</li>
              <li><strong className="text-slate-800">Tailwind CSS</strong> for municipal styling</li>
              <li><strong className="text-slate-800">React Router DOM</strong> role navigation</li>
              <li><strong className="text-slate-800">Leaflet & React-Leaflet</strong> for maps</li>
              <li><strong className="text-slate-800">Recharts</strong> for analytical breakdown</li>
              <li><strong className="text-slate-800">Axios</strong> with JWT interceptors</li>
            </ul>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
              <Database className="w-4 h-4" />
              <span>Backend & Database</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li><strong className="text-slate-800">Node.js & Express.js</strong> REST API</li>
              <li><strong className="text-slate-800">MongoDB Atlas / Local</strong></li>
              <li><strong className="text-slate-800">Mongoose</strong> schemas & 2dsphere indexes</li>
              <li><strong className="text-slate-800">JWT (JSON Web Token)</strong> auth</li>
              <li><strong className="text-slate-800">bcryptjs</strong> 10-round salt hashing</li>
              <li><strong className="text-slate-800">Multer</strong> multipart photo storage</li>
            </ul>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-cyan-700 font-bold text-sm">
              <Cpu className="w-4 h-4" />
              <span>AI / ML Microservice</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li><strong className="text-slate-800">Python 3.14 & FastAPI</strong></li>
              <li><strong className="text-slate-800">Scikit-learn</strong> ML pipeline</li>
              <li><strong className="text-slate-800">TF-IDF Vectorizer</strong> (n-grams 1-2)</li>
              <li><strong className="text-slate-800">LogisticRegression</strong> classification</li>
              <li><strong className="text-slate-800">Cosine Similarity</strong> on text</li>
              <li><strong className="text-slate-800">Haversine Distance</strong> on GPS</li>
            </ul>
          </div>

        </div>
      </section>

      {/* AI / ML Methodology Deep Dive */}
      <section className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-600" />
          <span>Explainable AI / ML Methodology</span>
        </h2>

        <div className="space-y-4 text-xs sm:text-sm text-slate-600">
          
          <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200/80 space-y-2">
            <h4 className="font-bold text-blue-900 text-sm">1. Complaint Classification Pipeline</h4>
            <p className="leading-relaxed">
              When a citizen enters an issue description, it is tokenized, stripped of English stop words, and vectorized into sublinear TF-IDF word and bigram features (Term Frequency - Inverse Document Frequency). A multi-class Logistic Regression classifier trained on a labeled civic dataset outputs category probabilities and maps to the appropriate municipal authority division.
            </p>
          </div>

          <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-200/80 space-y-2">
            <h4 className="font-bold text-amber-900 text-sm">2. Duplicate Detection Engine</h4>
            <p className="leading-relaxed">
              To prevent duplicate complaints from inflating backlogs, newly registered complaints are compared against non-resolved candidate issues within a 1.5 km radial envelope. The engine calculates TF-IDF cosine similarity between complaint text descriptions and geographical distance via the Haversine spherical equation:
            </p>
            <div className="p-2.5 bg-white rounded border border-amber-200 font-mono text-[11px] text-slate-700">
              d = 2R × arctan2(√a, √(1-a)), where a = sin²(Δlat/2) + cos(lat1)cos(lat2)sin²(Δlng/2)
            </div>
            <p className="text-xs text-slate-500">
              Complaints matching both proximity (&lt; 150m) and text similarity (&gt; 15%) or high text similarity (&gt; 70% within 1.2km) are automatically flagged with the matching complaint ID for authority review.
            </p>
          </div>

          <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-200/80 space-y-2">
            <h4 className="font-bold text-emerald-900 text-sm">3. Transparent Multi-Factor Priority Scoring</h4>
            <p className="leading-relaxed">
              Unlike a black-box neural network that cannot be explained during project evaluation, CivicLens calculates priority using a transparent, multi-factor scoring mechanism:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 pl-2">
              <li><strong>Hazard & Emergency Keywords:</strong> +35 points (accident, live wire, open manhole, hospital, school, collapse)</li>
              <li><strong>Baseline Category Severity:</strong> +12 points (electrical, drainage, deep road craters)</li>
              <li><strong>Clustered Citizen Volume:</strong> +10 points per additional report in same vicinity</li>
              <li><strong>SLA Aging Penalty:</strong> +3 points per day unresolved</li>
              <li><strong>Thresholds:</strong> High (≥ 70 pts), Medium (42-69 pts), Low (&lt; 42 pts)</li>
            </ul>
          </div>

        </div>
      </section>

      {/* Role-Based Access Control Specification */}
      <section className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <span>Role-Based Access Control (RBAC) Workflow</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Access Scope</th>
                <th className="py-2.5 px-3">Allowed Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-3 font-bold text-blue-700">Citizen</td>
                <td className="py-2.5 px-3">Own complaints only</td>
                <td className="py-2.5 px-3">Submit issue, upload photo, view timeline, inspect resolution photos</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-amber-700">Authority Staff</td>
                <td className="py-2.5 px-3">Department assigned issues</td>
                <td className="py-2.5 px-3">Review AI category/priority, update workflow status, upload resolution proof</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-emerald-700">Administrator</td>
                <td className="py-2.5 px-3">City-wide municipal database</td>
                <td className="py-2.5 px-3">Manage departments, manage users, reassign staff, view hotspot density map</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
