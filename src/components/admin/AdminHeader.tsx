
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Settings, FileText } from 'lucide-react';

const AdminHeader = () => {
  const { logout, hasPermission, currentAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };
  
  return (
    <header className="bg-company shadow-md">
      <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center">
        <div className="flex items-center space-x-2 mb-2 md:mb-0">
          <h1 className="text-white text-2xl font-bold">لوحة تحكم الدعم الفني</h1>
          {currentAdmin && (
            <span className="text-white text-sm opacity-75 mr-2">
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
