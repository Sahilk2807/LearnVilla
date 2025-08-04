import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminProtectedRoute: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user?.is_admin) {
    // Redirect non-admins to the home page or a "not authorized" page
    return <Navigate to="/admin/login" replace />;
  }
  
  return <Outlet />;
};

export default AdminProtectedRoute;