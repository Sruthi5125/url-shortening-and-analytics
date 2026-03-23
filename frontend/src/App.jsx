import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';

import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PublicStatsPage } from './pages/PublicStatsPage';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
};

const AnimatedPage = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className="h-full"
  >
    {children}
  </motion.div>
);

const AppShell = () => {
  const location = useLocation();
  return (
    <div className="flex flex-col min-h-screen bg-[#0b0d17]">
      <Navbar />
      <main className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AnimatedPage><DashboardPage /></AnimatedPage>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics/:id"
              element={
                <ProtectedRoute>
                  <AnimatedPage><AnalyticsPage /></AnimatedPage>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
};

const AppContent = () => (
  <Routes>
    <Route path="/login"             element={<LoginPage />} />
    <Route path="/signup"            element={<SignupPage />} />
    <Route path="/stats/:shortCode"  element={<PublicStatsPage />} />
    <Route path="/*"                 element={<AppShell />} />
  </Routes>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;