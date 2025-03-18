
import { useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BranchesManager from '@/components/admin/BranchesManager';
import SiteFieldsManager from '@/components/admin/SiteFieldsManager';
import AdminManager from '@/components/admin/AdminManager';
import ReportGenerator from '@/components/admin/ReportGenerator';
import { Settings, Users, Building, FileText, ListFilter } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('branches');
  const { hasPermission } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check permissions
    if (!hasPermission('view_only')) {
      toast.error('ليس لديك الصلاحية للوصول لهذه الصفحة');
      navigate('/admin/dashboard');
    }
  }, [hasPermission, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-company text-right mb-6">إعدادات النظام</h1>
            
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full mb-8">
                <TabsTrigger value="branches" className="flex items-center gap-2">
                  <Building size={16} />
                  <span>الفروع</span>
                </TabsTrigger>
                <TabsTrigger value="fields" className="flex items-center gap-2">
                  <ListFilter size={16} />
                  <span>حقول الموقع</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="admins" 
                  className="flex items-center gap-2"
                  disabled={!hasPermission('manage_admins')}
                >
                  <Users size={16} />
                  <span>المديرين</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <FileText size={16} />
                  <span>التقارير</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="flex items-center gap-2"
                  disabled={!hasPermission('manage_admins')}
                >
                  <Settings size={16} />
                  <span>إعدادات النظام</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="branches">
                <BranchesManager />
              </TabsContent>
              
              <TabsContent value="fields">
                <SiteFieldsManager />
              </TabsContent>
              
              <TabsContent value="admins">
                <AdminManager />
              </TabsContent>
              
              <TabsContent value="reports">
                <ReportGenerator />
              </TabsContent>
              
              <TabsContent value="settings">
                <Card>
                  <CardContent className="p-6 text-right">
                    <p className="text-muted-foreground">سيتم إضافة المزيد من الإعدادات هنا قريبًا</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminSettings;
