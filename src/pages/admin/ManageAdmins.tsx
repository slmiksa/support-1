
import React, { useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Navigate } from 'react-router-dom';
import AdminManager from '@/components/admin/AdminManager';
import { Container } from '@/components/ui/container';
import { toast } from 'sonner';

const ManageAdmins = () => {
  const { isAuthenticated, hasPermission, currentAdmin } = useAdminAuth();
  
  useEffect(() => {
    // Debug information
    console.log("ManageAdmins - Authentication state:", isAuthenticated);
    console.log("ManageAdmins - Current admin:", currentAdmin);
    console.log("ManageAdmins - Has manage_admins permission:", hasPermission('manage_admins'));
    
    // Check if the component mounted properly
    console.log("ManageAdmins component mounted");
  }, [isAuthenticated, currentAdmin, hasPermission]);

  if (!isAuthenticated) {
    console.log("ManageAdmins - Not authenticated, redirecting to login");
    return <Navigate to="/admin/login" replace />;
  }

  if (!hasPermission('manage_admins')) {
    console.log("ManageAdmins - No permission, redirecting to dashboard");
    toast.error("ليس لديك صلاحيات للوصول إلى هذه الصفحة");
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="py-8">
        <Container>
          <AdminManager />
        </Container>
      </main>
    </div>
  );
};

export default ManageAdmins;
