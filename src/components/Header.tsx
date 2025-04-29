import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  const [settingsInitialized, setSettingsInitialized] = useState(false);
  useEffect(() => {
    fetchSiteSettings();
  }, []);
  const fetchSiteSettings = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('site_settings').select('*').single();
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
  const logoUrl = settings.logo_url || logoSvg;
  if (!settingsInitialized) {
    return null;
  }
  return <header className="w-full">
      {/* Top header with company name and logo */}
      <div className="bg-gradient-to-r from-company to-company-dark py-6 shadow-lg">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo and company name */}
            <div className="flex items-center gap-5">
              <div className="relative w-16 h-16 md:w-20 md:h-20 overflow-hidden rounded-lg shadow-lg bg-white p-1">
                <AspectRatio ratio={1 / 1} className="overflow-hidden">
                  <img src={logoUrl} alt={settings.site_name} className="object-contain h-full w-full" />
                </AspectRatio>
              </div>
              
              <div className="text-center md:text-right">
                <h1 className="text-white text-xl md:text-2xl font-bold">{settings.site_name}</h1>
                <p className="text-white/80 text-sm mt-1"></p>
              </div>
            </div>
            
            {/* Description - hidden on mobile */}
            <p className="text-white/90 text-sm max-w-md hidden md:block"></p>
          </div>
        </Container>
      </div>
      
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md border-b border-gray-100">
        <Container>
          <div className="flex justify-center md:justify-start flex-wrap py-2">
            <div className="flex gap-2">
              <Link to="/" className="nav-link-primary">
                <Home size={18} />
                <span>الرئيسية</span>
              </Link>
              
              <Link to="/ticket-status" className="nav-link-secondary">
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
    </header>;
};
export default Header;