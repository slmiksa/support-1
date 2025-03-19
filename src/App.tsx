
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import AdminDashboard from './pages/admin/AdminDashboard';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import AdminLogin from './pages/admin/AdminLogin';
import AdminTicketDetails from './pages/admin/AdminTicketDetails';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminSettings from './pages/admin/AdminSettings';
import ManageAdmins from './pages/admin/ManageAdmins';
import TicketStatus from './pages/TicketStatus';

// Import Toaster from sonner
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
              <Route path="/admin/tickets/:ticketId" element={<AdminTicketDetails />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/manage-admins" element={<ManageAdmins />} />
              <Route path="/ticket-status" element={<TicketStatus />} />
              <Route path="/ticket-status/:ticketId" element={<TicketStatus />} />
            </Routes>
            <Toaster closeButton richColors position="top-left" />
          </QueryClientProvider>
        </AdminAuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
