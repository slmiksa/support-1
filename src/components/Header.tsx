
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, PhoneOutgoing, Sparkles } from 'lucide-react';
import { supabase, SiteSettings } from '@/integrations/supabase/client';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Container } from '@/components/ui/container';
import logoSvg from '../assets/logo.svg';

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: 'شركة الوصل الوطنية لتحصيل ديون جهات التمويل',
  page_title: 'شركة الوصل الوطنية',
  logo_url: '',
  favicon_url: '',
  primary_color: '#034078',
  secondary_color: '#001F3F',
  text_color: '#ffffff',
  footer_text: '© 2024 شركة الوصل الوطنية لتحصيل ديون جهات التمويل. جميع الحقوق محفوظة.'
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
      const { data, error } = await supabase.from('site_settings').select('*').single();
      
      if (error) {
        if (error.code !== 'PGRST116') {
          // Not found error
          console.error('Error fetching site settings:', error);
        }
        // Use default settings if no settings found
        setSettingsInitialized(true);
        setLoading(false);
        return;
      }
      
      if (data) {
        // Cast to unknown first to avoid type errors
        setSettings(data as unknown as SiteSettings);

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
    <header className="w-full">
      {/* Top header with company name and logo */}
      <div className="bg-gradient-to-r from-company to-company-dark py-6">
        <Container>
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Logo with animation */}
            <div className="relative w-32 h-32 logo-pulse">
              <AspectRatio ratio={1/1} className="overflow-hidden">
                <img 
                  src={logoUrl} 
                  alt={settings.site_name} 
                  className="object-contain h-full w-full"
                />
              </AspectRatio>
              <div className="absolute inset-0 rounded-full animate-pulse-light" style={{
                boxShadow: '0 0 20px 8px rgba(3, 64, 120, 0.4)',
                filter: 'blur(10px)',
                opacity: 0.6
              }}></div>
            </div>
            
            <div className="text-center space-y-2">
              <h1 className="text-white text-2xl md:text-3xl font-bold">{settings.site_name}</h1>
              <p className="text-white/80 text-sm md:text-base max-w-xl">
                نظام الدعم الفني المتكامل لتقديم الخدمات وحل المشكلات
              </p>
            </div>
          </div>
        </Container>
      </div>
      
      {/* Navigation Bar */}
      <nav className="bg-company-dark py-3 shadow-md">
        <Container>
          <div className="flex justify-center flex-wrap gap-4">
            <Link to="/" className="navigation-link">
              <Home size={18} />
              <span>الرئيسية</span>
            </Link>
            
            <Link to="/ticket-status" className="navigation-link">
              <Search size={18} />
              <span>متابعة التذاكر</span>
            </Link>
            
            <Link to="/admin/login" className="navigation-link">
              <PhoneOutgoing size={18} />
              <span>لوحة التحكم</span>
            </Link>
          </div>
        </Container>
      </nav>
      
      {/* Developer footer */}
      <div className="fixed bottom-0 left-0 right-0 py-2 px-4 bg-white/80 backdrop-blur-md text-gray-700 text-xs text-center z-10 border-t shadow-md">
        <Container className="flex justify-center items-center gap-1">
          <Sparkles size={12} className="text-company" />
          <span>© 2025 شركة الوصل الوطنية لتحصيل ديون جهات التمويل. جميع الحقوق محفوظة. | تطوير Trndsky ( FixDesk 2.0 )</span>
          <Sparkles size={12} className="text-company" />
        </Container>
      </div>
    </header>
  );
};

export default Header;
