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
import { Image, Palette, Type, HeadphonesIcon, HelpCircleIcon, Plus, X, AlertCircle, Loader2 } from 'lucide-react';
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

// إعدادات فارغة بدلاً من القيم الإفتراضية
const DEFAULT_SETTINGS: SiteSettings = {
  site_name: '',
  page_title: '',
  logo_url: '',
  favicon_url: '',
  primary_color: '#0f72c1',
  secondary_color: '#0a4f88',
  text_color: '#ffffff',
  footer_text: '',
  support_available: true,
  support_message: '',
  support_info: '',
  support_help_fields: []
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
  // إضافة متغيرات جديدة للتتبع
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [savingInProgress, setSavingInProgress] = useState(false);
  const { hasPermission } = useAdminAuth();
  
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');
        
      if (error) {
        console.error('Error fetching site settings:', error);
        toast.error('حدث خطأ أثناء جلب إعدادات الموقع');
        if (error.code === 'PGRST116') {
          await createDefaultSettings();
        } else {
          throw error;
        }
      } else if (data && data.length > 0) {
        // استخدام أول صف من البيانات
        const settingsData = data[0] as unknown as SiteSettings;
        console.log("Fetched settings:", settingsData);
        setSettings(settingsData);
        
        // تعيين معاينات الشعار والأيقونة إذا كانت موجودة
        if (settingsData.logo_url) {
          setLogoPreview(settingsData.logo_url);
          console.log("Logo URL set:", settingsData.logo_url.substring(0, 100) + "...");
        }
        if (settingsData.favicon_url) {
          setFaviconPreview(settingsData.favicon_url);
          console.log("Favicon URL set:", settingsData.favicon_url.substring(0, 100) + "...");
        }
        
        // تحليل حقول المساعدة إذا كانت موجودة
        if (data[0].support_help_fields) {
          try {
            const helpFieldsData = typeof data[0].support_help_fields === 'string' 
              ? JSON.parse(data[0].support_help_fields) 
              : data[0].support_help_fields;
            setHelpFields(Array.isArray(helpFieldsData) ? helpFieldsData : []);
          } catch (e) {
            console.error('Error parsing help fields:', e);
            setHelpFields([]);
          }
        }
      } else if (data && data.length === 0) {
        // إذا لم يتم العثور على أي بيانات، قم بإنشاء الإعدادات الافتراضية
        await createDefaultSettings();
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
      // إنشاء بيانات فارغة مع التحديثات الجديدة
      const defaultSettings = { 
        ...DEFAULT_SETTINGS,
        primary_color: '#0f72c1',
        secondary_color: '#0a4f88',
        support_available: true,
        support_message: ''
      };
      
      const dbSettings = {
        site_name: '',
        page_title: '',
        logo_url: '',
        favicon_url: '',
        primary_color: '#0f72c1',
        secondary_color: '#0a4f88', 
        text_color: '#ffffff',
        footer_text: '',
        support_available: defaultSettings.support_available || true,
        support_message: defaultSettings.support_message || '',
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
    setSavingInProgress(true);
    try {
      // تحضير البيانات المحلية للحفظ
      // تأكد من عدم فقدان أي بيانات من المعاينة للشعار والأيقونة
      let logoToSave = settings.logo_url;
      let faviconToSave = settings.favicon_url;
      
      // إذا كان هناك معاينة للشعار ولكن ليس هناك شعار في الإعدادات، استخدم المعاينة
      if (!logoToSave && logoPreview) {
        logoToSave = logoPreview;
        console.log("Using logo preview for saving:", logoToSave ? "Preview exists" : "No preview");
      }
      
      // نفس الشيء للأيقونة
      if (!faviconToSave && faviconPreview) {
        faviconToSave = faviconPreview;
        console.log("Using favicon preview for saving:", faviconToSave ? "Preview exists" : "No preview");
      }
      
      // تجهيز بيانات الإعدادات النهائية للحفظ
      const finalSettings = {
        ...settings,
        logo_url: logoToSave || '', // تأكد من أن القيمة ليست فارغة
        favicon_url: faviconToSave || '' // تأكد من أن القيمة ليست فارغة
      };
      
      // عرض تفاصيل حفظ البيانات للتصحيح
      console.log('====== SAVING SETTINGS ======');
      console.log('Logo URL:', logoToSave ? logoToSave.substring(0, 50) + '...' : 'None');
      console.log('Favicon URL:', faviconToSave ? faviconToSave.substring(0, 50) + '...' : 'None');
      console.log('============================');

      // تجهيز بيانات الإعدادات بأنواع مناسبة
      const cleanSettings = {
        site_name: finalSettings.site_name || '',
        page_title: finalSettings.page_title || '',
        logo_url: finalSettings.logo_url || '',
        favicon_url: finalSettings.favicon_url || '',
        primary_color: finalSettings.primary_color || '#0f72c1',
        secondary_color: finalSettings.secondary_color || '#0a4f88',
        text_color: finalSettings.text_color || '#ffffff',
        footer_text: finalSettings.footer_text || '',
        support_available: finalSettings.support_available === true,
        support_message: finalSettings.support_message || '',
        support_info: finalSettings.support_info || '',
        support_help_fields: helpFields as unknown as Json,
        company_sender_email: finalSettings.company_sender_email || '',
        company_sender_name: finalSettings.company_sender_name || ''
      };
      
      // إذا كانت إعدادات البريد الإلكتروني موجودة، قم بتحويلها إلى JSON
      if (finalSettings.email_settings) {
        (cleanSettings as any).email_settings = finalSettings.email_settings as unknown as Json;
      }

      console.log('Clean settings for submission:', cleanSettings);

      // تحقق مما إذا كانت هناك بيانات موجودة بالفعل
      const { data, error: countError } = await supabase
        .from('site_settings')
        .select('id');

      if (countError) {
        console.error('Error checking existing settings:', countError);
        throw countError;
      }

      let error;
      
      if (data && data.length > 0) {
        // تحديث الصف الموجود مع الإعدادات المحدثة
        const { error: updateError, data: updateData } = await supabase
          .from('site_settings')
          .update(cleanSettings)
          .eq('id', data[0].id)
          .select();
        
        error = updateError;
        
        if (!updateError && updateData) {
          console.log("Update successful, updated data:", updateData);
        }
      } else {
        // إدراج صف جديد إذا لم توجد بيانات سابقة
        const { error: insertError, data: insertData } = await supabase
          .from('site_settings')
          .insert([cleanSettings])
          .select();
        
        error = insertError;
        
        if (!insertError && insertData) {
          console.log("Insert successful, inserted data:", insertData);
        }
      }
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // تحديث الإعدادات المحلية بعد الحفظ الناجح
      setSettings(prevState => ({
        ...prevState,
        logo_url: logoToSave || '',
        favicon_url: faviconToSave || ''
      }));
      
      toast.success('تم حفظ إعدادات الموقع بنجاح');
      setSavedSuccessfully(true);
      
      if (cleanSettings.page_title) {
        document.title = cleanSettings.page_title;
      }
      
      if (cleanSettings.favicon_url) {
        updateFavicon(cleanSettings.favicon_url);
      }
      
      // إعادة جلب البيانات للتأكيد
      await fetchSettings();
    } catch (error) {
      console.error('Error saving site settings:', error);
      toast.error('حدث خطأ أثناء حفظ إعدادات الموقع');
      setSavedSuccessfully(false);
    } finally {
      setLoading(false);
      setSavingInProgress(false);
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
      // مسح قيمة الإدخال للسماح بإعادة تحميل نفس الملف
      event.target.value = '';
      
      // تحويل الملف إلى base64
      const base64Data = await fileToBase64(file);
      
      // معاينة الصورة
      setLogoPreview(base64Data);
      console.log("Logo preview set:", base64Data.substring(0, 100) + "...");
      
      // تحديث الإعدادات ببيانات base64
      setSettings(prevSettings => ({
        ...prevSettings,
        logo_url: base64Data
      }));
      
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
      console.log("Updating favicon to:", faviconUrl.substring(0, 100) + "...");
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = faviconUrl;
      
      // تحديث الأيقونة المصغرة أيضًا
      let shortcutLink = document.querySelector("link[rel~='shortcut icon']") as HTMLLinkElement;
      if (!shortcutLink) {
        shortcutLink = document.createElement('link');
        shortcutLink.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(shortcutLink);
      }
      shortcutLink.href = faviconUrl;
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
      // مسح قيمة الإدخال للسماح بإعادة تحميل نفس الملف
      event.target.value = '';
      
      // تحويل الملف إلى base64
      const base64Data = await fileToBase64(file);
      
      // معاينة الصورة
      setFaviconPreview(base64Data);
      console.log("Favicon preview set:", base64Data.substring(0, 100) + "...");
      
      // تحديث الإعدادات ببيانات base64
      setSettings(prevSettings => ({
        ...prevSettings,
        favicon_url: base64Data
      }));
      
      // تحديث أيقونة المتصفح
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

  // تتبع التغييرات في الإعدادات
  useEffect(() => {
    if (savedSuccessfully) {
      const timer = setTimeout(() => {
        setSavedSuccessfully(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [savedSuccessfully]);

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-white/80 -z-10"></div>
      
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={saveSettings}
            disabled={loading}
            className={`transition-all ${savedSuccessfully 
              ? 'bg-green-500 hover:bg-green-600' 
              : savingInProgress 
                ? 'bg-yellow-500 hover:bg-yellow-600' 
                : 'bg-support hover:bg-support-dark'}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الحفظ...
              </span>
            ) : savedSuccessfully ? 'تم الحفظ بنجاح ✓' : 'حفظ الإعدادات'}
          </Button>
          <h2 className="text-xl font-bold text-right gradient-text">تخصيص واجهة الموقع</h2>
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
          <TabsList className="grid grid-cols-5 w-full mb-6 bg-gray-100/80">
            <TabsTrigger value="general" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Type size={16} />
              <span>الإعدادات العامة</span>
            </TabsTrigger>
            <TabsTrigger value="logo" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Image size={16} />
              <span>الشعار</span>
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Palette size={16} />
              <span>الألوان</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <HeadphonesIcon size={16} />
              <span>الدعم الفني</span>
            </TabsTrigger>
            <TabsTrigger value="helpInfo" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <HelpCircleIcon size={16} />
              <span>معلومات مساعدة</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="space-y-4 support-card p-6">
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
            <div className="space-y-4 support-card p-6">
              <div className="space-y-2">
                <Label htmlFor="logo" className="text-right block mb-2">شعار الموقع</Label>
                
                {logoPreview && (
                  <div className="mb-4 p-4 border rounded-lg bg-gray-50/80 flex justify-center">
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
                    <div className="mb-4 p-4 border rounded-lg bg-gray-50/80 flex justify-center">
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
            <div className="space-y-4 support-card p-6">
              <div className="space-y-2">
                <Label htmlFor="primary_color" className="text-right block">اللون الرئيسي (الهيدر)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primary_color"
                    value={settings.primary_color || '#0f72c1'}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    placeholder="#0f72c1"
                    className="text-right"
                  />
                  <input
                    type="color"
                    value={settings.primary_color || '#0f72c1'}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                </div>
                <p className="text-xs text-gray-500 text-right">
                  اللون المقترح الجديد: #0f72c1 (أزرق)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary_color" className="text-right block">اللون الثانوي (القائمة)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="secondary_color"
                    value={settings.secondary_color || '#0a4f88'}
                    onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                    placeholder="#0a4f88"
                    className="text-right"
                  />
                  <input
                    type="color"
                    value={settings.secondary_color || '#0a4f88'}
                    onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                </div>
                <p className="text-xs text-gray-500 text-right">
                  اللون المقتر�� الجديد: #0a4f88 (أزرق داكن)
                </p>
              </div>

              <div className="mt-4 p-4 border rounded-lg bg-white/80">
                <h3 className="text-right font-medium mb-2">معاينة الألوان</h3>
                <div 
                  className="h-12 rounded-t-lg flex items-center justify-center shadow-sm" 
                  style={{ background: `linear-gradient(135deg, ${settings.primary_color || '#0f72c1'}, ${settings.secondary_color || '#0a4f88'})` }}
                >
                  <span style={{ color: settings.text_color || '#ffffff' }}>الهيدر</span>
                </div>
                <div 
                  className="h-8 rounded-b-lg flex items-center justify-center bg-white shadow-sm border-t border-white/20"
                >
                  <span className="text-support">القائمة</span>
                </div>
              </div>

              <div className="mt-4 p-4 border rounded-lg bg-white/80">
                <h3 className="text-right font-medium mb-2">اقتراحات ألوان مميزة</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div 
                    className="h-16 rounded-lg cursor-pointer hover:scale-105 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #0f72c1, #0a4f88)' }}
                    onClick={() => setSettings({ ...settings, primary_color: '#0f72c1', secondary_color: '#0a4f88' })}
                  ></div>
                  <div 
                    className="h-16 rounded-lg cursor-pointer hover:scale-105 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #1e40af)' }}
                    onClick={() => setSettings({ ...settings, primary_color: '#3b82f6', secondary_color: '#1e40af' })}
                  ></div>
                  <div 
                    className="h-16 rounded-lg cursor-pointer hover:scale-105 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #06b6d4, #0e7490)' }}
                    onClick={() => setSettings({ ...settings, primary_color: '#06b6d4', secondary_color: '#0e7490' })}
                  ></div>
                  <div 
                    className="h-16 rounded-lg cursor-pointer hover:scale-105 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}
                    onClick={() => setSettings({ ...settings, primary_color: '#8b5cf6', secondary_color: '#6d28d9' })}
                  ></div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="support">
            <div className="space-y-6 support-card p-6">
              <div className="p-4 border rounded-lg bg-support-light/50">
                <div className="flex items-center justify-between mb-4">
                  <Switch 
                    id="support_available"
                    checked={settings.support_available || false}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, support_available: checked })
                    }
                    className="data-[state=checked]:bg-support"
                  />
                  <Label htmlFor="support_available" className="text-right font-medium">
                    تفعيل الدعم الفني
                  </Label>
                </div>
                
                <div className="flex gap-2 items-center justify-end">
                  <div 
                    className={`w-4 h-4 rounded-full ${(settings.support_available || false) ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
                  ></div>
                  <p className="text-sm">
                    {(settings.support_available || false) ? 'الدعم الفني متاح حالياً' : 'الدعم الفني غير متاح حالياً'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="support_message" className="text-right block">رسالة حالة الدعم الفني</Label>
                <Input
                  id="support_message"
                  value={settings.support_message || ''}
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
                  className="bg-support hover:bg-support-dark flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>إضافة حقل معلومات</span>
                </Button>
                
                <h3 className="text-right font-semibold text-lg gradient-text">حقول المعلومات المساعدة</h3>
              </div>
              
              <div className="text-right text-sm text-gray-600 mb-4">
                <p>يمكنك إضافة عدة حقول معلومات مساعدة ستظهر في الصفحة الرئيسية عند الضغط على أيقونة المساعدة</p>
              </div>
              
              {helpFields.length === 0 ? (
                <div className="p-4 border rounded-lg bg-gray-50 text-center text-gray-500">
                  لا توجد حقول معلومات مساعدة. اضغط على زر "إضافة حقل معلومات" لإضافة حقل جديد.
                </div>
              ) : (
                <div className="space-y-6">
                  {helpFields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 bg-white/80 relative support-card">
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
                            value={field.title || ''}
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
                            value={field.content || ''}
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
              
              <div className="p-4 border rounded-lg bg-gray-50/80 mt-6 support-card">
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
              
              <div className="p-4 border rounded-lg bg-gray-50/80 support-card">
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
