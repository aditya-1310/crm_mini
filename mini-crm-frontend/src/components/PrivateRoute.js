import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // Show loading spinner or placeholder while authentication state is being determined
  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  return currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute; 