import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import JoinWorkspacePage from './pages/JoinWorkspacePage';

function LandingRoute() {
  const { isAuthenticated } = useAuth();
  return <LandingPage isAuthenticated={isAuthenticated} />;
}

export default function App() {
  return (
    <>
      <Toaster 
        theme="dark" 
        position="top-right" 
        richColors 
        toastOptions={{
          style: {
            background: '#0f172a',
            border: '1px solid #334155',
            color: '#f8fafc',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/workspace/:id" 
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/join/:token" 
          element={
            <ProtectedRoute>
              <JoinWorkspacePage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
