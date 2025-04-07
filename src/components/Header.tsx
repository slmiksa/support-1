import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, SiteSettings } from '@/integrations/supabase/client';
import logoSvg from '../assets/logo.svg';

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: 'شركة الوصل الوطنية لتحصيل ديون جهات التمويل',
  page_title: 'شركة الوصل الوطنية',
  logo_url: '',
  favicon_url: '',
  primary_color: '#D4AF37',
  secondary_color: '#B08C1A',
  text_color: '#ffffff',
  footer_text: '© 2024 شركة الوصل الوطنية لتحصيل ديون جهات التمويل. جميع الحقوق محفوظة.',
};

const Header = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [settingsInitialized, setSettingsInitialized] = useState(false);

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Not found error
          console.error('Error fetching site settings:', error);
        }
        // Use default settings if no settings found
        setSettingsInitialized(true);
        setLoading(false);
        return;
      }

      if (data) {
        setSettings(data as SiteSettings);
        
        // تحديث عنوان الصفحة إذا كان موجودًا
        if (data.page_title) {
          document.title = data.page_title;
        }
        
        // تحديث أيقونة المتصفح إذا كانت موجودة
        if (data.favicon_url) {
          updateFavicon(data.favicon_url);
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
  
  // دالة لتحديث أيقونة المتصفح
  const updateFavicon = (faviconUrl: string) => {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = faviconUrl;
  };

  // Use default logo if no logo_url is set
  const logoUrl = settings.logo_url || logoSvg;
  
  // Don't render anything until settings are initialized to prevent flash of default styling
  if (!settingsInitialized) {
    return null;
  }

  return (
    <div className="flex flex-col w-full">
      {/* Top header with logo and company name */}
      <div 
        className="w-full py-4 px-6" 
        style={{ backgroundColor: settings.primary_color }}
      >
        <div className="container mx-auto flex flex-col items-center space-y-3">
          {/* Logo with glowing effect */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full animate-pulse-light" 
                 style={{ 
                   boxShadow: '0 0 15px 5px #D4AF37', 
                   filter: 'blur(8px)',
                   opacity: 0.6
                 }}>
            </div>
            <img 
              src={logoUrl} 
              alt={settings.site_name} 
              className="h-32 w-auto relative z-10" 
            />
          </div>
          <div className="flex flex-col items-center">
            <h1 
              className="text-xl md:text-2xl font-bold text-center text-white" 
            >
              {settings.site_name}
            </h1>
          </div>
        </div>
      </div>
      
      {/* Navigation bar with dynamic background color from settings */}
      <nav 
        className="w-full py-3 px-6 shadow-md mb-6" 
        style={{ backgroundColor: settings.secondary_color }}
      >
        <div className="container mx-auto flex justify-center space-x-6 rtl:space-x-reverse">
          <Link 
            to="/" 
            className="flex items-center"
          >
            <div className="px-4 py-2 rounded-lg flex items-center gap-2 bg-white shadow-md">
              <div className="h-5 w-5 rounded-full flex items-center justify-center">
                <Home className="h-3 w-3 text-[#222222]" />
              </div>
              <span className="font-medium text-lg text-[#222222]">الرئيسية</span>
            </div>
          </Link>
          <div className="border-r border-white/20 h-8 self-center"></div>
          <Link 
            to="/ticket-status" 
            className="flex items-center"
          >
            <div className="px-4 py-2 rounded-lg flex items-center gap-2 bg-white shadow-md">
              <div className="h-5 w-5 rounded-full flex items-center justify-center">
                <Search className="h-3 w-3 text-[#222222]" />
              </div>
              <span className="font-medium text-lg text-[#222222]">متابعة التذاكر</span>
            </div>
          </Link>
        </div>
      </nav>
      
      {/* Developer footer */}
      <div className="fixed bottom-0 left-0 right-0 py-1 px-4 bg-gray-100 text-[#222222] text-xs text-center z-10 border-t">
        © 2025 شركة الوصل الوطنية لتحصيل ديون جهات التمويل. جميع الحقوق محفوظة.
      </div>
    </div>
  );
};

export default Header;
