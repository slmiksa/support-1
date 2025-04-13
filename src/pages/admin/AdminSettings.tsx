
import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BranchesManager from '@/components/admin/BranchesManager';
import SiteFieldsManager from '@/components/admin/SiteFieldsManager';
import AdminManager from '@/components/admin/AdminManager';
import ReportGenerator from '@/components/admin/ReportGenerator';
import NotificationSettings from '@/components/admin/NotificationSettings';
import SiteCustomizationManager from '@/components/admin/SiteCustomizationManager';
import { Settings, Users, Building, FileText, ListFilter, Bell, PaintBucket } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('branches');
  const { hasPermission } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!hasPermission('view_only')) {
      toast({
        title: "خطأ",
        description: "ليس لديك الصلاحية للوصول لهذه الصفحة",
        variant: "destructive"
      });
      navigate('/admin/dashboard');
    }
    
    fetchAndUpdateFavicon();
    
    // عند تغيير علامة التبويب، تحديث العنوان في URL
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['branches', 'fields', 'admins', 'reports', 'notifications', 'customization', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [hasPermission, navigate, toast]);
  
  // تحديث URL عند تغيير علامة التبويب
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
  };
  
  const fetchAndUpdateFavicon = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('favicon_url')
        .single();
        
      if (error) {
        console.error('Error fetching favicon:', error);
        return;
      }
      
      if (data && data.favicon_url) {
        updateFavicon(data.favicon_url);
      }
    } catch (error) {
      console.error('Error in fetchAndUpdateFavicon:', error);
    }
  };
  
  const updateFavicon = (faviconUrl: string) => {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = faviconUrl;
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-6">
        <Card className="dark:border-border/20">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-company text-right mb-6">إعدادات النظام</h1>
            
            <Tabs 
              value={activeTab} 
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 md:grid-cols-7 w-full mb-8 dark:bg-muted/50">
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
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell size={16} />
                  <span>الإشعارات</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="customization" 
                  className="flex items-center gap-2"
                  disabled={!hasPermission('manage_admins')}
                >
                  <PaintBucket size={16} />
                  <span>تخصيص الواجهة</span>
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
              
              <TabsContent value="notifications">
                <NotificationSettings />
              </TabsContent>
              
              <TabsContent value="customization">
                <SiteCustomizationManager />
              </TabsContent>
              
              <TabsContent value="settings">
                <Card className="dark:border-border/20">
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
