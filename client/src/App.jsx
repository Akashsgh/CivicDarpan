import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Citizen Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import SubmitComplaint from './pages/citizen/SubmitComplaint';
import MyComplaints from './pages/citizen/MyComplaints';
import ComplaintDetails from './pages/citizen/ComplaintDetails';

// Authority Pages
import AuthorityDashboard from './pages/authority/AuthorityDashboard';
import AssignedComplaints from './pages/authority/AssignedComplaints';
import AuthorityMapView from './pages/authority/AuthorityMapView';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AllComplaints from './pages/admin/AllComplaints';
import HotspotAnalytics from './pages/admin/HotspotAnalytics';
import ManageUsers from './pages/admin/ManageUsers';
import ManageDepartments from './pages/admin/ManageDepartments';
import ManageCategories from './pages/admin/ManageCategories';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/complaints/:id" element={<ComplaintDetails />} />

              {/* Citizen Routes */}
              <Route
                path="/citizen/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/report"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <SubmitComplaint />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/my-complaints"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <MyComplaints />
                  </ProtectedRoute>
                }
              />

              {/* Authority Staff Routes */}
              <Route
                path="/authority/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['authority', 'admin']}>
                    <AuthorityDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/authority/assigned"
                element={
                  <ProtectedRoute allowedRoles={['authority', 'admin']}>
                    <AssignedComplaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/authority/map"
                element={
                  <ProtectedRoute allowedRoles={['authority', 'admin']}>
                    <AuthorityMapView />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/complaints"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AllComplaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/hotspots"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <HotspotAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/departments"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageDepartments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageCategories />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Municipal Footer */}
          <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">CivicLens Platform</span>
                <span>•</span>
                <span>B.Tech Final Year Computer Science Major Project</span>
              </div>
              <div className="text-slate-400">
                Single-City Municipal Corporation Edition (Academic Demonstration)
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
