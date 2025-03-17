import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import ReportListPage from './pages/report/ReportListPage';
import ReportDetailPage from './pages/report/ReportDetailPage';
import SubscriptionListPage from './pages/subscription/SubscriptionListPage';
import { useAuth } from './context/AuthContext';
import { CircularProgress } from '@mui/material';

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/" element={currentUser ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<ReportListPage />} />
        <Route path="/reports/:reportId" element={<ReportDetailPage />} />
        <Route path="/subscriptions" element={<SubscriptionListPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
