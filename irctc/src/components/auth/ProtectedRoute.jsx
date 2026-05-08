import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isUserLoggedIn } = useAuth();
  const location = useLocation();

  if (!isUserLoggedIn) {
    // Redirect to login, but save the intended destination (including URL parameters like trainId!)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If logged in, render the intended component
  return children;
};

export default ProtectedRoute;