
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Home } from 'lucide-react';

const AdminHeader = () => {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };
  
  return (
    <header className="bg-company shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-white text-2xl font-bold">لوحة تحكم الدعم الفني</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="secondary" 
            className="flex items-center space-x-2 ml-2"
            onClick={() => navigate('/admin/dashboard')}
          >
            <Home className="h-4 w-4" />
            <span>الرئيسية</span>
          </Button>
          <Button 
            variant="destructive" 
            className="flex items-center space-x-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>تسجيل الخروج</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
