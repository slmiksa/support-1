import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Index from './pages/Index';
import AdminDashboard from './pages/admin/AdminDashboard';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import AdminLogin from './pages/admin/AdminLogin';
import AdminTicketDetails from './pages/admin/AdminTicketDetails';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminSettings from './pages/admin/AdminSettings';
import ManageAdmins from './pages/admin/ManageAdmins';
import TicketStatus from './pages/TicketStatus';
import { ThemeProvider } from './contexts/ThemeContext';

// Import Toaster from sonner
import { Toaster } from 'sonner';

const queryClient = new QueryClient();

// مكون لمراقبة تغييرات المسار
const RouteChangeObserver = () => {
  const location = useLocation();
  
  useEffect(() => {
    const adminPaths = ['/admin', '/admin/'];
    const pathname = location.pathname;
    const isAdminPage = pathname.startsWith('/admin/') || adminPaths.includes(pathname);
    const root = window.document.documentElement;
    
    if (!isAdminPage) {
      // إزالة الوضع المظلم من الصفحات غير الإدارية
      root.classList.remove('dark');
    } else {
      // استعادة الثيم المحفوظ للصفحات الإدارية
      const savedTheme = localStorage.getItem('admin-theme');
      if (savedTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [location]);
  
  return null;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ThemeProvider>
          <RouteChangeObserver />
          <AdminAuthProvider>
            <QueryClientProvider client={queryClient}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/tickets/:ticketId" element={<AdminTicketDetails />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/manage-admins" element={<ManageAdmins />} />
                <Route path="/ticket-status" element={<TicketStatus />} />
                <Route path="/ticket-status/:ticketId" element={<TicketStatus />} />
              </Routes>
              <Toaster closeButton richColors position="top-left" />
            </QueryClientProvider>
          </AdminAuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
