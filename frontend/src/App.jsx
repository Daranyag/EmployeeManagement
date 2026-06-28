import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import EmployeeManagement from './pages/EmployeeManagement';
import LeaveManagement from './pages/LeaveManagement';
import ComplaintSystem from './pages/ComplaintSystem';
import Messaging from './pages/Messaging';
import PendingApproval from './pages/PendingApproval';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div>
      {/* Mobile Top Header */}
      <div className="mobile-header">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
          EM<span style={{ color: 'var(--accent-color)' }}>System</span>
        </h2>
        <button
          className="hamburger-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle Navigation Menu"
        >
          <span style={{ transform: sidebarOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></span>
          <span style={{ opacity: sidebarOpen ? 0 : 1 }}></span>
          <span style={{ transform: sidebarOpen ? 'rotate(-45deg) translate(6px, -6px)' : 'none' }}></span>
        </button>
      </div>

      <div className="app-container">
        {/* Pass sidebarOpen and close function */}
        <Sidebar isOpen={sidebarOpen} closeMenu={() => setSidebarOpen(false)} />
        
        {/* Main Content Pane */}
        <div className="main-content">
          {children}
        </div>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { user } = useContext(AuthContext);

  if (user && user.status === 'pending') {
    return (
      <Routes>
        <Route path="*" element={<PendingApproval />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" replace />} />
      <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/" replace />} />
      
      <Route path="/profile-setup" element={
        <ProtectedRoute skipProfileCheck={true}>
          {user && user.isProfileCompleted ? <Navigate to="/" replace /> : <ProfileSetup />}
        </ProtectedRoute>
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/employees" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <MainLayout>
            <EmployeeManagement />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/leaves" element={
        <ProtectedRoute>
          <MainLayout>
            <LeaveManagement />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/complaints" element={
        <ProtectedRoute>
          <MainLayout>
            <ComplaintSystem />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/messages" element={
        <ProtectedRoute>
          <MainLayout>
            <Messaging />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
