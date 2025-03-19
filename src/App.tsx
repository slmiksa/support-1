import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import AdminDashboard from './pages/admin/AdminDashboard';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import AdminLogin from './pages/admin/AdminLogin';
import AdminTicketsDetails from './pages/admin/AdminTicketsDetails';
import { QueryClient, QueryClientProvider } from 'react-query';
import AdminSettings from './pages/admin/AdminSettings';
import ManageAdmins from './pages/admin/ManageAdmins';

// قم بتضمين مكون Toaster من مكتبة sonner
import { Toaster } from 'sonner';

const queryClient = new QueryClient();

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AdminAuthProvider>
          <QueryClientProvider client={queryClient}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/tickets/:ticketId" element={<AdminTicketsDetails />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/manage-admins" element={<ManageAdmins />} />
            </Routes>
            <Toaster closeButton richColors rtl position="top-left" />
          </QueryClientProvider>
        </AdminAuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
