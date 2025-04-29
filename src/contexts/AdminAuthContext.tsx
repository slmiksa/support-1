
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

type AdminRole = 'super_admin' | 'admin' | 'viewer';

interface AdminUser {
  id: string;
  username: string;
  role: AdminRole;
  employee_id?: string;
  notification_email?: string;
}

interface AdminAuthContextProps {
  isAuthenticated: boolean;
  currentAdmin: AdminUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: 'manage_tickets' | 'view_only' | 'manage_admins' | 'respond_to_tickets' | 'delete_tickets') => boolean;
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
    const checkAuth = () => {
      const adminAuth = localStorage.getItem('admin_auth');
      const adminData = localStorage.getItem('admin_data');
      
      if (adminAuth === 'true' && adminData) {
        setIsAuthenticated(true);
        try {
          const parsedData = JSON.parse(adminData);
          if (
            parsedData.role === 'super_admin' ||
            parsedData.role === 'admin' ||
            parsedData.role === 'viewer'
          ) {
            setCurrentAdmin(parsedData as AdminUser);
          } else {
            setCurrentAdmin({
              ...parsedData,
              role: 'viewer' as AdminRole
            });
          }
          
          console.log("Auth initialized with admin:", parsedData);
        } catch (error) {
          console.error('Error parsing admin data:', error);
          setIsAuthenticated(false);
          setCurrentAdmin(null);
        }
      } else {
        setIsAuthenticated(false);
        setCurrentAdmin(null);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_admin_credentials', {
        p_username: username,
        p_password: password
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      if (data) {
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('id, username, role, employee_id, notification_email')
          .eq('username', username)
          .single();

        if (adminError) {
          console.error('Admin data fetch error:', adminError);
          return false;
        }

        const validRole = ['super_admin', 'admin', 'viewer'].includes(adminData.role) 
          ? adminData.role as AdminRole 
          : 'viewer' as AdminRole;

        const validatedAdminData: AdminUser = {
          id: adminData.id,
          username: adminData.username,
          role: validRole,
          employee_id: adminData.employee_id,
          notification_email: adminData.notification_email
        };

        console.log("Admin logged in:", validatedAdminData);
        
        localStorage.setItem('admin_auth', 'true');
        localStorage.setItem('admin_data', JSON.stringify(validatedAdminData));
        setIsAuthenticated(true);
        setCurrentAdmin(validatedAdminData);
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
    console.log("Admin logged out");
  };

  const hasPermission = (permission: 'manage_tickets' | 'view_only' | 'manage_admins' | 'respond_to_tickets' | 'delete_tickets'): boolean => {
    if (!currentAdmin) return false;
    
    // Debug permissions
    console.log("Current admin role:", currentAdmin.role);
    console.log("Requested permission:", permission);

    switch (permission) {
      case 'manage_tickets':
        return ['super_admin', 'admin'].includes(currentAdmin.role);
      case 'view_only':
        return ['super_admin', 'admin', 'viewer'].includes(currentAdmin.role);
      case 'manage_admins':
        return currentAdmin.role === 'super_admin';
      case 'respond_to_tickets':
        return ['super_admin', 'admin'].includes(currentAdmin.role);
      case 'delete_tickets':
        return ['super_admin', 'admin'].includes(currentAdmin.role);
      default:
        return false;
    }
  };

  return (
    <AdminAuthContext.Provider value={{ 
      isAuthenticated, 
      currentAdmin, 
      login, 
      logout, 
      hasPermission
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
