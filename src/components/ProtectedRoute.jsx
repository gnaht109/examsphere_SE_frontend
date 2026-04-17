import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect them to login, but save the current location they were trying to go to
    return <Navigate resolve to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;