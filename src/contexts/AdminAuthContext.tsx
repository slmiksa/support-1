
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

type AdminRole = 'super_admin' | 'admin' | 'viewer';

interface AdminUser {
  id: string;
  username: string;
  role: AdminRole;
  employee_id?: string;
}

interface AdminAuthContextProps {
  isAuthenticated: boolean;
  currentAdmin: AdminUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: 'manage_tickets' | 'view_only' | 'manage_admins') => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextProps>({
  isAuthenticated: false,
  currentAdmin: null,
  login: async () => false,
  logout: () => {},
  hasPermission: () => false,
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);

  useEffect(() => {
    // Check if admin is logged in from local storage
    const checkAuth = () => {
      const adminAuth = localStorage.getItem('admin_auth');
      const adminData = localStorage.getItem('admin_data');
      
      if (adminAuth === 'true' && adminData) {
        setIsAuthenticated(true);
        setCurrentAdmin(JSON.parse(adminData));
      } else {
        setIsAuthenticated(false);
        setCurrentAdmin(null);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Call the Supabase function to check admin credentials
      const { data, error } = await supabase.rpc('check_admin_credentials', {
        p_username: username,
        p_password: password
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      if (data) {
        // Fetch admin details
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('id, username, role, employee_id')
          .eq('username', username)
          .single();

        if (adminError) {
          console.error('Admin data fetch error:', adminError);
          return false;
        }

        localStorage.setItem('admin_auth', 'true');
        localStorage.setItem('admin_data', JSON.stringify(adminData));
        setIsAuthenticated(true);
        setCurrentAdmin(adminData);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_data');
    setIsAuthenticated(false);
    setCurrentAdmin(null);
  };

  const hasPermission = (permission: 'manage_tickets' | 'view_only' | 'manage_admins'): boolean => {
    if (!currentAdmin) return false;

    switch (permission) {
      case 'manage_tickets':
        return ['super_admin', 'admin'].includes(currentAdmin.role);
      case 'view_only':
        return ['super_admin', 'admin', 'viewer'].includes(currentAdmin.role);
      case 'manage_admins':
        return currentAdmin.role === 'super_admin';
      default:
        return false;
    }
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, currentAdmin, login, logout, hasPermission }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
