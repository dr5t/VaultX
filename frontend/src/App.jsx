import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const MainLayout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '260px', minHeight: '100vh' }}>
        <Navbar />
        <main className="container animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <VaultProvider>
        <Router>
          <Toaster position="top-right" toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.1)',
            }
          }} />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout><Dashboard /></MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/vault" element={
              <ProtectedRoute>
                <MainLayout><Vault /></MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/generator" element={
              <ProtectedRoute>
                <MainLayout><Generator /></MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <MainLayout><Settings /></MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </VaultProvider>
    </AuthProvider>
  );
}

export default App;
