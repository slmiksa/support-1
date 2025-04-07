import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase, SiteSettings, HelpField } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Image, Palette, Type, HeadphonesIcon, HelpCircleIcon, Plus, X } from 'lucide-react';

// Generate a UUID v4 compatible string
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: 'شركة الوصل الوطنية لتحصيل ديون جهات التمويل',
  page_title: 'شركة الوصل الوطنية',
  logo_url: '',
  favicon_url: '',
  primary_color: '#D4AF37', 
  secondary_color: '#B08C1A', 
  text_color: '#ffffff', 
  footer_text: '© 2024 شركة الوصل الوطنية لتحصيل ديون جهات التمويل. جميع الحقوق محفوظة.',
  support_available: true,
  support_message: 'الدعم الفني متواجد',
  support_info: '<p>رقم تحويلة الدعم الفني: 2014</p><p>موقع الإجازات: <a href="https://test.com" target="_blank">www.test.com</a></p>',
  support_help_fields: [],
};

const SiteCustomizationManager = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [helpFields, setHelpFields] = useState<HelpField[]>([]);
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
        // Cast to unknown first to avoid type errors
        const settingsData = data as unknown as SiteSettings;
        setSettings(settingsData);
        
        // Parse help fields if they exist
        if (data.support_help_fields) {
          try {
            const helpFieldsData = typeof data.support_help_fields === 'string' 
              ? JSON.parse(data.support_help_fields) 
              : data.support_help_fields;
            setHelpFields(Array.isArray(helpFieldsData) ? helpFieldsData : []);
          } catch (e) {
            console.error('Error parsing help fields:', e);
            setHelpFields([]);
          }
        }
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
        .insert([DEFAULT_SETTINGS as any]);
        
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
      // Convert helpFields to JSON compatible format
      const updatedSettings = {
        ...settings,
        support_help_fields: helpFields
      };
      
      const { error } = await supabase
        .from('site_settings')
        .upsert([updatedSettings as any]);
        
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
      const fileName = `logo_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `logos/${fileName}`;
      
      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);
      
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, { 
          cacheControl: '3600', 
          upsert: true 
        });
        
      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }
      
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
      
      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);
      
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, { 
          cacheControl: '3600', 
          upsert: true 
        });
        
      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }
      
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

  const addHelpField = () => {
    const newField: HelpField = {
      id: generateUUID(),
      title: '',
      content: ''
    };
    setHelpFields([...helpFields, newField]);
  };

  const removeHelpField = (id: string) => {
    setHelpFields(helpFields.filter(field => field.id !== id));
  };

  const updateHelpField = (id: string, fieldKey: keyof HelpField, value: string) => {
    setHelpFields(helpFields.map(field => 
      field.id === id ? { ...field, [fieldKey]: value } : field
    ));
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
          <TabsList className="grid grid-cols-5 w-full mb-6">
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
            <TabsTrigger value="helpInfo" className="flex items-center gap-2">
              <HelpCircleIcon size={16} />
              <span>معلومات مساعدة</span>
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
          
          <TabsContent value="helpInfo">
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <Button
                  onClick={addHelpField}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>إضافة حقل معلومات</span>
                </Button>
                
                <h3 className="text-right font-semibold text-lg">حقول المعلومات المساعدة</h3>
              </div>
              
              <div className="text-right text-sm text-gray-600 mb-4">
                <p>يمكنك إض��فة عدة حقول معلومات مساعدة ستظهر في الصفحة الرئيسية عند الضغط على أيقونة المساعدة</p>
              </div>
              
              {helpFields.length === 0 ? (
                <div className="p-4 border rounded-lg bg-gray-50 text-center text-gray-500">
                  لا توجد حقول معلومات مساعدة. اضغط على زر "إضافة حقل معلومات" لإضافة حقل جديد.
                </div>
              ) : (
                <div className="space-y-6">
                  {helpFields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 bg-gray-50 relative">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 left-2 h-8 w-8"
                        onClick={() => removeHelpField(field.id)}
                      >
                        <X size={16} />
                      </Button>
                      
                      <div className="mb-4">
                        <h4 className="text-right font-medium mb-2">الحقل رقم {index + 1}</h4>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`field-title-${field.id}`} className="text-right block">
                            عنوان الحقل
                          </Label>
                          <Input
                            id={`field-title-${field.id}`}
                            value={field.title}
                            onChange={(e) => updateHelpField(field.id, 'title', e.target.value)}
                            placeholder="مثال: رقم تحويلة الدعم الفني"
                            className="text-right"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`field-content-${field.id}`} className="text-right block">
                            محتوى الحقل
                          </Label>
                          <Textarea
                            id={`field-content-${field.id}`}
                            value={field.content}
                            onChange={(e) => updateHelpField(field.id, 'content', e.target.value)}
                            placeholder="مثال: 2014"
                            className="text-right min-h-[100px]"
                          />
                          <p className="text-xs text-gray-500 text-right">
                            يمكنك استخدام وسوم HTML مثل &lt;p&gt; و &lt;a&gt; لتنسيق النص
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="p-4 border rounded-lg bg-gray-50 mt-6">
                <h3 className="text-right font-medium mb-3">معاينة المعلومات المساعدة</h3>
                {helpFields.length > 0 ? (
                  <div className="border rounded-md p-4 bg-white">
                    {helpFields.map((field) => (
                      <div key={field.id} className="mb-3 last:mb-0 pb-3 last:pb-0 border-b last:border-b-0">
                        <h4 className="font-medium text-right mb-1">{field.title || 'عنوان الحقل'}</h4>
                        <div 
                          className="text-sm text-right"
                          dangerouslySetInnerHTML={{ __html: field.content || 'محتوى الحقل' }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 text-gray-500">
                    أضف حقول معلومات لرؤية المعاينة هنا
                  </div>
                )}
              </div>
              
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="text-right font-medium mb-3">الطريقة القديمة: معلومات مساعدة (نص HTML)</h3>
                <div className="space-y-2">
                  <Label htmlFor="support_info" className="text-right block">معلومات مساعدة</Label>
                  <Textarea
                    id="support_info"
                    value={settings.support_info || ''}
                    onChange={(e) => setSettings({ ...settings, support_info: e.target.value })}
                    placeholder="أدخل المعلومات المساعدة هنا... يمكنك استخدام HTML"
                    className="text-right min-h-[150px]"
                  />
                  <p className="text-xs text-gray-500 text-right">
                    ملاحظة: هذا النص سيظهر فقط إذا لم تكن هناك حقول معلومات مساعدة
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SiteCustomizationManager;
