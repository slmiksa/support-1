
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
import { Image, Palette, Type, HeadphonesIcon, HelpCircleIcon, Plus, X, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Json } from '@/integrations/supabase/types';

// Generate a UUID v4 compatible string
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Convert File to base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// إزالة الإعدادات الافتراضية
const DEFAULT_SETTINGS: SiteSettings = {
  site_name: '',
  page_title: '',
  logo_url: '',
  favicon_url: '',
  primary_color: '', 
  secondary_color: '', 
  text_color: '', 
  footer_text: '',
  support_available: true,
  support_message: 'الدعم الفني متواجد',
  support_info: '',
  support_help_fields: [],
};

const SiteCustomizationManager = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [helpFields, setHelpFields] = useState<HelpField[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
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
        
        // Set logo and favicon previews if they exist
        if (settingsData.logo_url) {
          setLogoPreview(settingsData.logo_url);
        }
        if (settingsData.favicon_url) {
          setFaviconPreview(settingsData.favicon_url);
        }
        
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
      // إنشاء بيانات فارغة
      const defaultSettings = { 
        ...DEFAULT_SETTINGS,
        support_available: true,
        support_message: 'الدعم الفني متواجد'
      };
      
      const dbSettings = {
        site_name: '',
        page_title: '',
        logo_url: '',
        favicon_url: '',
        primary_color: '',
        secondary_color: '', 
        text_color: '',
        footer_text: '',
        support_available: defaultSettings.support_available || true,
        support_message: defaultSettings.support_message || 'الدعم الفني متواجد',
        support_info: '',
        support_help_fields: [] as unknown as Json
      };
      
      const { error } = await supabase
        .from('site_settings')
        .insert([dbSettings]);
        
      if (error) throw error;
      
      setSettings(defaultSettings);
      toast.success('تم إنشاء الإعدادات الافتراضية بنجاح');
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
      // Debug the data we're sending
      console.log('Saving settings:', settings);
      console.log('Help fields:', helpFields);

      // Prepare settings data with proper types
      const cleanSettings = {
        site_name: settings.site_name || '',
        page_title: settings.page_title || '',
        logo_url: settings.logo_url || '',
        favicon_url: settings.favicon_url || '',
        primary_color: settings.primary_color || '#D4AF37',
        secondary_color: settings.secondary_color || '#B08C1A',
        text_color: settings.text_color || '#ffffff',
        footer_text: settings.footer_text || '',
        support_available: settings.support_available === true,
        support_message: settings.support_message || '',
        support_info: settings.support_info || '',
        support_help_fields: helpFields as unknown as Json,
        company_sender_email: settings.company_sender_email || '',
        company_sender_name: settings.company_sender_name || ''
      };
      
      // If email settings exist, convert them to JSON
      if (settings.email_settings) {
        (cleanSettings as any).email_settings = settings.email_settings as unknown as Json;
      }

      console.log('Cleaned settings for submission:', cleanSettings);
      
      const { error } = await supabase
        .from('site_settings')
        .upsert(cleanSettings);
        
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      toast.success('تم حفظ إعدادات الموقع بنجاح');
      
      if (settings.page_title) {
        document.title = settings.page_title;
      }
      
      if (settings.favicon_url) {
        updateFavicon(settings.favicon_url);
      }
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

    setUploadError(null);
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى تحميل ملف صورة فقط');
      return;
    }
    
    setUploading(true);
    try {
      // Clear input value to allow re-uploading the same file
      event.target.value = '';
      
      // Convert file to base64
      const base64Data = await fileToBase64(file);
      
      // Preview the image
      setLogoPreview(base64Data);
      
      // Update settings with base64 data
      setSettings({
        ...settings,
        logo_url: base64Data
      });
      
      toast.success('تم تحميل الشعار بنجاح');
    } catch (error) {
      console.error('Error uploading logo:', error);
      setUploadError('حدث خطأ أثناء معالجة الشعار. يرجى المحاولة مرة أخرى.');
      toast.error('حدث خطأ أثناء رفع الشعار: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setUploading(false);
    }
  };
  
  const updateFavicon = (faviconUrl: string) => {
    if (!faviconUrl) return;
    
    try {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = faviconUrl;
    } catch (error) {
      console.error('Error updating favicon:', error);
    }
  };
  
  const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasPermission('manage_admins')) {
      toast.error('ليس لديك صلاحية لتعديل إعدادات الموقع');
      return;
    }

    setUploadError(null);
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى تحميل ملف صورة فقط');
      return;
    }
    
    setUploadingFavicon(true);
    try {
      // Clear input value to allow re-uploading the same file
      event.target.value = '';
      
      // Convert file to base64
      const base64Data = await fileToBase64(file);
      
      // Preview the image
      setFaviconPreview(base64Data);
      
      // Update settings with base64 data
      setSettings({
        ...settings,
        favicon_url: base64Data
      });
      
      // Update favicon in browser
      updateFavicon(base64Data);
      
      toast.success('تم تحميل أيقونة المتصفح بنجاح');
    } catch (error) {
      console.error('Error uploading favicon:', error);
      setUploadError('حدث خطأ أثناء معالجة أيقونة المتصفح. يرجى المحاولة مرة أخرى.');
      toast.error('حدث خطأ أثناء رفع أيقونة المتصفح: ' + (error instanceof Error ? error.message : String(error)));
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

        {uploadError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>خطأ في الرفع</AlertTitle>
            <AlertDescription>
              {uploadError}
            </AlertDescription>
          </Alert>
        )}

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
                  value={settings.site_name || ''}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  placeholder="أدخل اسم الشركة"
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="page_title" className="text-right block">عنوان الصفحة (Page Title)</Label>
                <Input
                  id="page_title"
                  value={settings.page_title || ''}
                  onChange={(e) => setSettings({ ...settings, page_title: e.target.value })}
                  placeholder="أدخل عنوان الصفحة"
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
                
                {logoPreview && (
                  <div className="mb-4 p-4 border rounded-lg bg-gray-50 flex justify-center">
                    <img 
                      src={logoPreview} 
                      alt="شعار الموقع" 
                      className="h-16 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
                        toast.error('تعذر تحميل الشعار');
                      }}
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-end gap-2">
                  <div className="relative w-full">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploading}
                      className="text-right cursor-pointer"
                    />
                    <Label htmlFor="logo" className="text-xs text-gray-500 block mt-1">
                      {uploading ? 'جاري الرفع...' : 'اختر ملف'}
                    </Label>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 text-right mt-1">
                  يفضل استخدام صورة بخلفية شفافة بتنسيق PNG أو SVG
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo_url" className="text-right block">رابط الشعار (اختياري)</Label>
                <Input
                  id="logo_url"
                  value={settings.logo_url || ''}
                  onChange={(e) => {
                    setSettings({ ...settings, logo_url: e.target.value });
                    setLogoPreview(e.target.value);
                  }}
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
                  
                  {faviconPreview && (
                    <div className="mb-4 p-4 border rounded-lg bg-gray-50 flex justify-center">
                      <img 
                        src={faviconPreview} 
                        alt="أيقونة المتصفح" 
                        className="h-8 w-8 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).onerror = null;
                          (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
                          toast.error('تعذر تحميل الأيقونة');
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-end gap-2">
                    <div className="relative w-full">
                      <Input
                        id="favicon"
                        type="file"
                        accept="image/*"
                        onChange={handleFaviconUpload}
                        disabled={uploadingFavicon}
                        className="text-right cursor-pointer"
                      />
                      <Label htmlFor="favicon" className="text-xs text-gray-500 block mt-1">
                        {uploadingFavicon ? 'جاري الرفع...' : 'اختر ملف'}
                      </Label>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 text-right mt-1">
                    يفضل استخدام صورة مربعة بحجم 32×32 أو 64×64 بتنسيق PNG
                  </p>
                </div>
                
                <div className="space-y-2 mt-4">
                  <Label htmlFor="favicon_url" className="text-right block">رابط أيقونة المتصفح (اختياري)</Label>
                  <Input
                    id="favicon_url"
                    value={settings.favicon_url || ''}
                    onChange={(e) => {
                      setSettings({ ...settings, favicon_url: e.target.value });
                      setFaviconPreview(e.target.value);
                      if (e.target.value) updateFavicon(e.target.value);
                    }}
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
                <p>يمكنك إض��فة عدة حقول معلومات مساعدة ستظهر في الصفحة الر��يسية عند الضغط على أيقونة المساعدة</p>
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
