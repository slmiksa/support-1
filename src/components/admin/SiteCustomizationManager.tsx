import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase, SiteSettings } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Image, Palette, Type, HeadphonesIcon } from 'lucide-react';

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: 'شركة الوصل الوطنية لتحصيل ديون جهات التمويل',
  page_title: 'شركة الوصل الوطنية', // القيمة الافتراضية لعنوان الصفحة
  logo_url: '',
  favicon_url: '', // القيمة الافتراضية لأيقونة المتصفح
  primary_color: '#15437f', 
  secondary_color: '#093467', 
  text_color: '#ffffff', 
  footer_text: '© 2024 شركة الوصل الوطنية لتحصيل ديون جهات التمويل. جميع الحقوق محفوظة.',
  support_available: true,
  support_message: 'الدعم الفني متواجد',
};

const SiteCustomizationManager = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const { hasPermission } = useAdminAuth();
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          await createDefaultSettings();
        } else {
          throw error;
        }
      } else if (data) {
        setSettings(data as SiteSettings);
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
      toast.error('حدث خطأ أثناء جلب إعدادات الموقع');
    } finally {
      setLoading(false);
    }
  };
  
  const createDefaultSettings = async () => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .insert([DEFAULT_SETTINGS]);
        
      if (error) throw error;
      
      setSettings(DEFAULT_SETTINGS);
    } catch (error) {
      console.error('Error creating default settings:', error);
      toast.error('حدث خطأ أثناء إنشاء الإعدادات الافتراضية');
    }
  };
  
  const saveSettings = async () => {
    if (!hasPermission('manage_admins')) {
      toast.error('ليس لديك صلاحية لتعديل إعدادات الموقع');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert([settings]);
        
      if (error) throw error;
      
      toast.success('تم حفظ إعدادات الموقع بنجاح');
      
      if (settings.page_title) {
        document.title = settings.page_title;
      }
      
      if (settings.favicon_url) {
        updateFavicon(settings.favicon_url);
      }
      
      toast.info('قم بتحديث الصفحة لرؤية التغييرات على الموقع');
    } catch (error) {
      console.error('Error saving site settings:', error);
      toast.error('حدث خطأ أثناء حفظ إعدادات الموقع');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasPermission('manage_admins')) {
      toast.error('ليس لديك صلاحية لتعديل إعدادات الموقع');
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى تحميل ملف صورة فقط');
      return;
    }
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `logos/${fileName}`;
      
      await ensureStorageBucketExists('public');
      
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);
        
      setSettings({
        ...settings,
        logo_url: data.publicUrl
      });
      
      toast.success('تم رفع الشعار بنجاح');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('حدث خطأ أثناء رفع الشعار');
    } finally {
      setUploading(false);
    }
  };
  
  const ensureStorageBucketExists = async (bucketName: string) => {
    try {
      const { data, error } = await supabase.storage.getBucket(bucketName);
      
      if (error && error.message.includes('The resource was not found')) {
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true
        });
        
        if (createError) throw createError;
        
        console.log(`Created storage bucket: ${bucketName}`);
      }
    } catch (error) {
      console.error('Error ensuring storage bucket exists:', error);
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
  
  const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasPermission('manage_admins')) {
      toast.error('ليس لديك صلاحية لتعديل إعدادات الموقع');
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى تحميل ملف صورة فقط');
      return;
    }
    
    setUploadingFavicon(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `favicon_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `favicons/${fileName}`;
      
      await ensureStorageBucketExists('public');
      
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }
      
      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);
        
      setSettings({
        ...settings,
        favicon_url: data.publicUrl
      });
      
      updateFavicon(data.publicUrl);
      
      toast.success('تم رفع أيقونة المتصفح بنجاح');
    } catch (error) {
      console.error('Error uploading favicon:', error);
      toast.error('حدث خطأ أثناء رفع أيقونة المتصفح');
    } finally {
      setUploadingFavicon(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={saveSettings}
            disabled={loading}
            className="bg-company"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </Button>
          <h2 className="text-xl font-bold text-right">تخصيص واجهة الموقع</h2>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 w-full mb-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Type size={16} />
              <span>الإعدادات العامة</span>
            </TabsTrigger>
            <TabsTrigger value="logo" className="flex items-center gap-2">
              <Image size={16} />
              <span>الشعار</span>
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette size={16} />
              <span>الألوان</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <HeadphonesIcon size={16} />
              <span>الدعم الفني</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site_name" className="text-right block">اسم الشركة</Label>
                <Input
                  id="site_name"
                  value={settings.site_name}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  placeholder="اسم الشركة"
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="page_title" className="text-right block">عنوان الصفحة (Page Title)</Label>
                <Input
                  id="page_title"
                  value={settings.page_title}
                  onChange={(e) => setSettings({ ...settings, page_title: e.target.value })}
                  placeholder="عنوان الصفحة"
                  className="text-right"
                />
                <p className="text-xs text-gray-500 text-right">
                  هذا العنوان سيظهر في شريط المتصفح (Browser Tab) وفي نتائج البحث
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer_text" className="text-right block">نص التذييل (Footer)</Label>
                <Input
                  id="footer_text"
                  value={settings.footer_text}
                  onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                  placeholder="نص التذييل"
                  className="text-right"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logo">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo" className="text-right block mb-2">شعار الموقع</Label>
                
                {settings.logo_url && (
                  <div className="mb-4 p-4 border rounded-lg bg-gray-50 flex justify-center">
                    <img 
                      src={settings.logo_url} 
                      alt="شعار الموقع" 
                      className="h-16 object-contain"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-end gap-2">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    className="text-right"
                  />
                  <Label htmlFor="logo" className="text-xs text-gray-500 block">
                    {uploading ? 'جاري الرفع...' : 'اختر ملف'}
                  </Label>
                </div>
                
                <p className="text-xs text-gray-500 text-right mt-1">
                  يفضل استخدام صورة بخلفية شفافة بتنسيق PNG أو SVG
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo_url" className="text-right block">رابط الشعار (اختياري)</Label>
                <Input
                  id="logo_url"
                  value={settings.logo_url}
                  onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                  placeholder="أدخل رابط الشعار"
                  className="text-right"
                />
                <p className="text-xs text-gray-500 text-right">
                  يمكنك إضافة رابط مباشر للشعار بدلاً من رفع ملف
                </p>
              </div>
              
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-right font-semibold mb-4">أيقونة المتصفح (Favicon)</h3>
                <div className="space-y-2">
                  <Label htmlFor="favicon" className="text-right block mb-2">أيقونة المتصفح</Label>
                  
                  {settings.favicon_url && (
                    <div className="mb-4 p-4 border rounded-lg bg-gray-50 flex justify-center">
                      <img 
                        src={settings.favicon_url} 
                        alt="أيقونة المتصفح" 
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-end gap-2">
                    <Input
                      id="favicon"
                      type="file"
                      accept="image/*"
                      onChange={handleFaviconUpload}
                      disabled={uploadingFavicon}
                      className="text-right"
                    />
                    <Label htmlFor="favicon" className="text-xs text-gray-500 block">
                      {uploadingFavicon ? 'جاري الرفع...' : 'اختر ملف'}
                    </Label>
                  </div>
                  
                  <p className="text-xs text-gray-500 text-right mt-1">
                    يفضل استخدام صورة مربعة بحجم 32×32 أو 64×64 بتنسيق PNG أو ICO
                  </p>
                </div>
                
                <div className="space-y-2 mt-4">
                  <Label htmlFor="favicon_url" className="text-right block">رابط أيقونة المتصفح (اختياري)</Label>
                  <Input
                    id="favicon_url"
                    value={settings.favicon_url || ''}
                    onChange={(e) => setSettings({ ...settings, favicon_url: e.target.value })}
                    placeholder="أدخل رابط أيقونة المتصفح"
                    className="text-right"
                  />
                  <p className="text-xs text-gray-500 text-right">
                    يمكنك إضافة رابط مباشر للأيقونة بدلاً من رفع ملف
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="colors">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color" className="text-right block">اللون الرئيسي (الهيدر)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primary_color"
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    placeholder="#15437f"
                    className="text-right"
                  />
                  <input
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary_color" className="text-right block">اللون الثانوي (القائمة)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="secondary_color"
                    value={settings.secondary_color}
                    onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                    placeholder="#093467"
                    className="text-right"
                  />
                  <input
                    type="color"
                    value={settings.secondary_color}
                    onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="mt-4 p-4 border rounded-lg">
                <h3 className="text-right font-medium mb-2">معاينة الألوان</h3>
                <div 
                  className="h-12 rounded-t-lg flex items-center justify-center" 
                  style={{ backgroundColor: settings.primary_color }}
                >
                  <span style={{ color: settings.text_color }}>الهيدر</span>
                </div>
                <div 
                  className="h-8 rounded-b-lg flex items-center justify-center"
                  style={{ backgroundColor: settings.secondary_color }}
                >
                  <span style={{ color: settings.text_color }}>القائمة</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="support">
            <div className="space-y-6">
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <Switch 
                    id="support_available"
                    checked={settings.support_available}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, support_available: checked })
                    }
                  />
                  <Label htmlFor="support_available" className="text-right font-medium">
                    تفعيل الدعم الفني
                  </Label>
                </div>
                
                <div className="flex gap-2 items-center justify-end">
                  <div 
                    className={`w-4 h-4 rounded-full ${settings.support_available ? 'bg-green-500' : 'bg-red-500'}`}
                  ></div>
                  <p className="text-sm">
                    {settings.support_available ? 'الدعم الفني متاح حالياً' : 'الدعم الفني غير متاح حالياً'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="support_message" className="text-right block">رسالة حالة الدعم الفني</Label>
                <Input
                  id="support_message"
                  value={settings.support_message}
                  onChange={(e) => setSettings({ ...settings, support_message: e.target.value })}
                  placeholder="الدعم الفني متواجد"
                  className="text-right"
                />
                <p className="text-xs text-gray-500 text-right">
                  هذه الرسالة ستظهر للمستخدمين عند تفعيل الدعم الفني
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SiteCustomizationManager;
