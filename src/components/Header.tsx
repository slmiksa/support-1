
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Info, Headphones } from 'lucide-react';
import { supabase, SiteSettings } from '@/integrations/supabase/client';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Container } from '@/components/ui/container';
import logoSvg from '../assets/logo.svg';

// إزالة الإعدادات الافتراضية
const DEFAULT_SETTINGS: SiteSettings = {
  site_name: '',
  page_title: '',
  logo_url: '',
  favicon_url: '',
  primary_color: '#D4AF37',
  secondary_color: '#B08C1A',
  text_color: '#ffffff',
  footer_text: ''
};

const Header = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);
  const [settingsInitialized, setSettingsInitialized] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    fetchSiteSettings();
  }, []);
  
  const fetchSiteSettings = async () => {
    try {
      // استخدام استعلام يجلب جميع الصفوف
      const { data, error } = await supabase.from('site_settings').select('*');
      
      if (error) {
        console.error('Error fetching site settings:', error);
        setSettingsInitialized(true);
        setLoading(false);
        return;
      }
      
      // التحقق من وجود بيانات وأخذ أول صف
      if (data && data.length > 0) {
        // استخدم النوع المطلوب
        const settingsData = data[0] as unknown as SiteSettings;
        console.log("Fetched settings:", settingsData);
        setSettings(settingsData);
        
        // تعيين عنوان الصفحة إذا كان متاحًا
        if (settingsData.page_title) {
          document.title = settingsData.page_title;
        }
        
        // تحديث أيقونة المتصفح إذا كانت متاحة
        if (settingsData.favicon_url) {
          updateFavicon(settingsData.favicon_url);
        }
      }
      setSettingsInitialized(true);
    } catch (error) {
      console.error('Error:', error);
      setSettingsInitialized(true);
    } finally {
      setLoading(false);
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
  
  // استخدام الشعار الافتراضي إذا فشل تحميل الشعار المخصص
  const handleLogoError = () => {
    console.log('Logo failed to load, using default logo');
    setLogoError(true);
  };
  
  // التحقق مما إذا كان الشعار عبارة عن سلسلة base64 واستخدامها مباشرة
  const isBase64Image = (str: string) => {
    return str && str.startsWith('data:image');
  };
  
  const logoUrl = logoError ? logoSvg : (settings.logo_url && isBase64Image(settings.logo_url) ? 
    settings.logo_url : (settings.logo_url || logoSvg));
  
  const isTicketStatusActive = location.pathname.startsWith('/ticket-status');
  const isHomeActive = location.pathname === '/';
  
  if (!settingsInitialized) {
    return null;
  }
  
  return (
    <header className="w-full">
      {/* Header العلوي مع اسم الشركة والشعار */}
      <div 
        className="py-8 shadow-lg" 
        style={{ 
          background: `linear-gradient(to right, ${settings.primary_color || '#D4AF37'}, ${settings.secondary_color || '#B08C1A'})` 
        }}
      >
        <Container>
          <div className="flex flex-col items-center justify-center text-center">
            {/* الشعار واسم الشركة - مركزة وأكبر */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {/* مؤشر أيقونة الدعم الفني */}
                <div className="absolute -top-2 -left-2 bg-sky-500 text-white p-1 rounded-full z-10">
                  <Headphones size={16} />
                </div>
                
                {/* حاوية الشعار مع تأثير نبض الدعم المحسن */}
                <div className="relative w-28 h-28 md:w-36 md:h-36 overflow-hidden rounded-full shadow-lg bg-white p-2 logo-pulse">
                  <AspectRatio ratio={1 / 1} className="overflow-hidden">
                    <img 
                      src={logoUrl} 
                      alt={settings.site_name || 'شعار الموقع'} 
                      className="object-contain h-full w-full" 
                      onError={handleLogoError}
                    />
                  </AspectRatio>
                </div>
              </div>
              
              <div className="text-center">
                <h1 className="text-white text-xl md:text-3xl font-bold">{settings.site_name || ''}</h1>
                <p className="text-white/80 text-sm mt-1"></p>
              </div>
            </div>
          </div>
        </Container>
      </div>
      
      {/* شريط التنقل */}
      <nav className="bg-white shadow-md border-b border-gray-100">
        <Container>
          <div className="flex justify-center py-3">
            <div className="flex gap-3">
              <Link to="/" className={isHomeActive ? "nav-link-active" : "nav-link-primary"}>
                <Home size={18} />
                <span>الرئيسية</span>
              </Link>
              
              <Link to="/ticket-status" className={isTicketStatusActive ? "nav-link-active" : "nav-link-secondary"}>
                <Search size={18} />
                <span>متابعة التذاكر</span>
              </Link>
            </div>
          </div>
        </Container>
      </nav>
      
      {/* معلومات التذييل - مرئية فقط على الشاشات الكبيرة */}
      <div className="fixed bottom-0 left-0 right-0 py-2 px-4 bg-white/90 backdrop-blur-md text-gray-700 text-xs text-center z-10 border-t">
        <Container className="flex justify-center items-center gap-1">
          <Info size={12} className="text-company" />
          <span>{settings.footer_text || ''}</span>
        </Container>
      </div>
    </header>
  );
};

export default Header;
