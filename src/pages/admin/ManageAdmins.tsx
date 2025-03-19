
import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Navigate } from 'react-router-dom';

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
        <Card>
          <CardHeader>
            <CardTitle className="text-right">إدارة المشرفين</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-right">صفحة إدارة المشرفين قيد التطوير.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ManageAdmins;
