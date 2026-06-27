import React from 'react';
import { Navigate, Outlet } from 'react-router';

export default function ProtectedRoute() {
  const userStr = localStorage.getItem('arbeit-user');
  let isAdmin = false;

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.role === 'admin' || user.user?.role === 'admin') {
        isAdmin = true;
      }
    } catch (e) {
      console.error(e);
    }
  }

  return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
}
