
import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Navigate } from 'react-router-dom';
import AdminManager from '@/components/admin/AdminManager';
import { Container } from '@/components/ui/container';

const ManageAdmins = () => {
  const { isAuthenticated, hasPermission } = useAdminAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!hasPermission('manage_admins')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <AdminManager />
      </main>
    </div>
  );
};

export default ManageAdmins;
