import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const AdminRoute = ({ children }) => {
  const { isUserLoggedIn, user, isInitializing } = useAuth();

  // Wait for silent refresh to finish before kicking them out
  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isUserLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // 🔹 Check for the specific role
  if (user?.role !== 'ADMIN') {
    // If they are logged in but not an admin, send them to the homepage
    // (Alternatively, you could route them to an "Unauthorized" component)
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;