
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, SiteSettings } from '@/integrations/supabase/client';
import logoSvg from '../assets/logo.svg';

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: 'شركة الوصل الوطنية لتحصيل ديون جهات التمويل',
  logo_url: '',
  primary_color: '#15437f',
  secondary_color: '#093467',
  text_color: '#ffffff',
  footer_text: '© 2024 شركة الوصل الوطنية لتحصيل ديون جهات التمويل. جميع الحقوق محفوظة.',
};

const Header = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
        return;
      }

      if (data) {
        setSettings(data as SiteSettings);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use default logo if no logo_url is set
  const logoUrl = settings.logo_url || logoSvg;

  return (
    <div className="flex flex-col w-full">
      {/* Top header with logo and company name */}
      <div 
        className="w-full py-4 px-6" 
        style={{ backgroundColor: settings.primary_color }}
      >
        <div className="container mx-auto flex flex-col items-center space-y-3">
          {/* Logo without background rectangle */}
          <img 
            src={logoUrl} 
            alt={settings.site_name} 
            className="h-16 w-auto" 
          />
          <div className="flex flex-col items-center">
            <h1 
              className="text-xl md:text-2xl font-bold text-center" 
              style={{ color: settings.text_color }}
            >
              {settings.site_name}
            </h1>
            {/* Removed the underline div that was here */}
          </div>
        </div>
      </div>
      
      {/* Navigation bar */}
      <nav 
        className="w-full py-3 px-6 shadow-md mb-6"
        style={{ backgroundColor: settings.secondary_color }}
      >
        <div className="container mx-auto flex justify-center space-x-4 rtl:space-x-reverse">
          <Link 
            to="/" 
            className="hover:text-accent-gold transition-colors duration-200 mx-4 font-medium text-lg flex items-center"
            style={{ color: settings.text_color }}
          >
            <span>الرئيسية</span>
            <div className="h-5 w-5 rounded-full bg-white mr-2 flex items-center justify-center">
              <Home className="h-3 w-3 text-company" />
            </div>
          </Link>
          <Link 
            to="/ticket-status" 
            className="hover:text-accent-gold transition-colors duration-200 mx-4 font-medium text-lg flex items-center"
            style={{ color: settings.text_color }}
          >
            <span>متابعة طلب الدعم</span>
            <div className="h-5 w-5 rounded-full bg-white mr-2 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-company" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Header;
