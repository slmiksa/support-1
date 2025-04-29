
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Info } from 'lucide-react';
import { supabase, SiteSettings } from '@/integrations/supabase/client';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Container } from '@/components/ui/container';
import logoSvg from '../assets/logo.svg';

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: 'شركة الوصل الوطنية لتحصيل ديون جهات التمويل',
  page_title: 'شركة الوصل الوطنية',
  logo_url: '',
  favicon_url: '',
  primary_color: '#0f4c81',
  secondary_color: '#0a2f4f',
  text_color: '#ffffff',
  footer_text: '© 2024 شركة الوصل الوطنية لتحصيل ديون جهات التمويل. جميع الحقوق محفوظة.'
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
      const { data, error } = await supabase.from('site_settings').select('*').single();
      
      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error fetching site settings:', error);
        }
        setSettingsInitialized(true);
        setLoading(false);
        return;
      }
      
      if (data) {
        setSettings(data as unknown as SiteSettings);
        if (data.page_title) {
          document.title = data.page_title;
        }
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
  
  const updateFavicon = (faviconUrl: string) => {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = faviconUrl;
  };
  
  // Fallback to default logo if custom logo fails to load
  const handleLogoError = () => {
    console.log('Logo failed to load, using default logo');
    setLogoError(true);
  };
  
  const logoUrl = logoError ? logoSvg : (settings.logo_url || logoSvg);
  const isTicketStatusActive = location.pathname.startsWith('/ticket-status');
  const isHomeActive = location.pathname === '/';
  
  if (!settingsInitialized) {
    return null;
  }
  
  return (
    <header className="w-full">
      {/* Top header with company name and logo */}
      <div className="bg-gradient-to-r from-company to-company-dark py-8 shadow-lg">
        <Container>
          <div className="flex flex-col items-center justify-center text-center">
            {/* Logo and company name - centered and larger */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-28 h-28 md:w-36 md:h-36 overflow-hidden rounded-lg shadow-lg bg-white p-2 logo-pulse">
                <AspectRatio ratio={1 / 1} className="overflow-hidden">
                  <img 
                    src={logoUrl} 
                    alt={settings.site_name} 
                    className="object-contain h-full w-full" 
                    onError={handleLogoError}
                  />
                </AspectRatio>
              </div>
              
              <div className="text-center">
                <h1 className="text-white text-xl md:text-3xl font-bold">{settings.site_name}</h1>
                <p className="text-white/80 text-sm mt-1"></p>
              </div>
            </div>
          </div>
        </Container>
      </div>
      
      {/* Navigation Bar */}
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
      
      {/* Footer info - only visible on larger screens */}
      <div className="fixed bottom-0 left-0 right-0 py-2 px-4 bg-white/90 backdrop-blur-md text-gray-700 text-xs text-center z-10 border-t">
        <Container className="flex justify-center items-center gap-1">
          <Info size={12} className="text-company" />
          <span>{settings.footer_text || '© 2025 شركة الوصل الوطنية لتحصيل ديون جهات التمويل. جميع الحقوق محفوظة.'}</span>
        </Container>
      </div>
    </header>
  );
};

export default Header;
