import React from 'react';
import { Navigate } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen text="Checking session..." />;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

export default ProtectedRoute;
