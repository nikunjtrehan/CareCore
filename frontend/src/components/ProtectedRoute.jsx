// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_PATHS = {
  patient: '/dashboard/patient',
  doctor:  '/dashboard/doctor',
  nurse:   '/dashboard/nurse',
};

/** Redirects unauthenticated users to /auth; authenticated users to their role dashboard */
export default function ProtectedRoute({ children, allowedRole }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/40 font-mono text-sm tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // Wrong role — redirect to the correct dashboard
  if (allowedRole && role && role !== allowedRole) {
    return <Navigate to={ROLE_PATHS[role] || '/auth'} replace />;
  }

  return children;
}
