import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailsPage from './pages/ServiceDetailsPage';
import ProfilePage from './pages/ProfilePage';

import ProtectedRoute from './components/layout/ProtectedRoute';
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import TechnicianOnboardingPage from './pages/technician/TechnicianOnboardingPage';

import CreateServicePage from './pages/technician/CreateServicePage';
import EditServicePage from './pages/technician/EditServicePage';
import AdminDashboard from './pages/Admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:id" element={<ServiceDetailsPage />} />

          {/* User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Technician Routes */}
          <Route
            path="/technician/onboarding"
            element={
              <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                <TechnicianOnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technician/dashboard"
            element={
              <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                <TechnicianDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technician/create-service"
            element={
              <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                <CreateServicePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technician/edit-service/:id"
            element={
              <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                <EditServicePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['USER', 'TECHNICIAN', 'ADMIN']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          {/* Admin Routes */}
          <Route path="/admin" element={<LoginPage isAdminLogin={true} />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;
