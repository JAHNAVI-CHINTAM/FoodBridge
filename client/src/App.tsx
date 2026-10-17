import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DonorDashboard } from './pages/donor/DonorDashboard';
import { ReceiverDashboard } from './pages/receiver/ReceiverDashboard';
import { ProfilePage } from './pages/ProfilePage';

// Protected Route Guard
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRole?: 'donor' | 'receiver';
}> = ({ children, allowedRole }) => {
  const { isAuthenticated, isLoading, activeRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Loading Food Bridge...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login${allowedRole ? `?role=${allowedRole}` : ''}`} replace />;
  }

  // If role does not match, redirect to user's active role dashboard
  if (allowedRole && activeRole !== allowedRole) {
    return <Navigate to={activeRole === 'donor' ? '/donor' : '/receiver'} replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Universal Fixed Dark-Themed Minimal Food Photography Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-luminosity pointer-events-none z-0"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=2400&q=80')` }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950 pointer-events-none z-0" />

      {/* Main Content Layout */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />

            {/* Donor Dashboard */}
            <Route
              path="/donor/*"
              element={
                <ProtectedRoute allowedRole="donor">
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Receiver Dashboard */}
            <Route
              path="/receiver/*"
              element={
                <ProtectedRoute allowedRole="receiver">
                  <ReceiverDashboard />
                </ProtectedRoute>
              }
            />

            {/* Profile Route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <div className="py-8 px-4 sm:px-6 lg:px-8">
                    <ProfilePage />
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
