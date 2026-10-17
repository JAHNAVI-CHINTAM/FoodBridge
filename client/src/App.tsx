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
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf9]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading Food Bridge...</p>
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
    <div className="flex flex-col min-h-screen bg-[#fafaf9]">
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
