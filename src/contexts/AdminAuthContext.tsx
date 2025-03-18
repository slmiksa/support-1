
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminAuthContextProps {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextProps>({
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check if admin is logged in from local storage
    const checkAuth = () => {
      const adminAuth = localStorage.getItem('admin_auth');
      setIsAuthenticated(adminAuth === 'true');
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
        localStorage.setItem('admin_auth', 'true');
        setIsAuthenticated(true);
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
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
