import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VaultProvider } from './context/VaultContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Vault from './pages/Vault';
import Generator from './pages/Generator';
import Settings from './pages/Settings';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ThreeBackground from './components/ThreeBackground';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const MainLayout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '260px', minHeight: '100vh', position: 'relative' }}>
        <Navbar />
        <main className="container">
          {children}
        </main>
      </div>
    </div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout><PageWrapper><Dashboard /></PageWrapper></MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/vault" element={
          <ProtectedRoute>
            <MainLayout><PageWrapper><Vault /></PageWrapper></MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/generator" element={
          <ProtectedRoute>
            <MainLayout><PageWrapper><Generator /></PageWrapper></MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <MainLayout><PageWrapper><Settings /></PageWrapper></MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <VaultProvider>
        <Router>
          <ThreeBackground />
          <Toaster position="top-right" />
          <AnimatedRoutes />
        </Router>
      </VaultProvider>
    </AuthProvider>
  );
}

export default App;
