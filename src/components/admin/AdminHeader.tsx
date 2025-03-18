
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Settings, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, SiteSettings } from '@/integrations/supabase/client';

const DEFAULT_SETTINGS = {
  primary_color: '#15437f',
  text_color: '#ffffff',
};

const AdminHeader = () => {
  const { logout, hasPermission, currentAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('primary_color, text_color')
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Not found error
          console.error('Error fetching site settings:', error);
        }
        return;
      }

      if (data) {
        setSettings({
          primary_color: data.primary_color,
          text_color: data.text_color,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };
  
  return (
    <header style={{ backgroundColor: settings.primary_color }} className="shadow-md">
      <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center">
        <div className="flex items-center space-x-2 mb-2 md:mb-0">
          <h1 className="text-2xl font-bold" style={{ color: settings.text_color }}>لوحة تحكم الدعم الفني</h1>
          {currentAdmin && (
            <span className="text-sm opacity-75 mr-2" style={{ color: settings.text_color }}>
              ({currentAdmin.username})
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2 flex-wrap">
          <Button 
            variant="secondary" 
            className="flex items-center space-x-2 ml-2 mb-2 md:mb-0"
            onClick={() => navigate('/admin/dashboard')}
          >
            <Home className="h-4 w-4 ml-1" />
            <span>الرئيسية</span>
          </Button>
          <Button 
            variant="secondary" 
            className="flex items-center space-x-2 ml-2 mb-2 md:mb-0"
            onClick={() => navigate('/admin/settings')}
          >
            <Settings className="h-4 w-4 ml-1" />
            <span>الإعدادات</span>
          </Button>
          <Button 
            variant="destructive" 
            className="flex items-center space-x-2 mb-2 md:mb-0"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 ml-1" />
            <span>تسجيل الخروج</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
