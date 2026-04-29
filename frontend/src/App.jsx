import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage       from './pages/LandingPage';
import AuthPage          from './pages/AuthPage';
import PatientDashboard  from './pages/PatientDashboard';
import DoctorDashboard   from './pages/DoctorDashboard';
import NurseDashboard    from './pages/NurseDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/"     element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Role-protected dashboards */}
          <Route
            path="/dashboard/patient"
            element={
              <ProtectedRoute allowedRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor"
            element={
              <ProtectedRoute allowedRole="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/nurse"
            element={
              <ProtectedRoute allowedRole="nurse">
                <NurseDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
