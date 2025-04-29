
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Info, Headphones, PanelRight, CheckCircle } from 'lucide-react';
import { supabase, SiteSettings } from '@/integrations/supabase/client';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Container } from '@/components/ui/container';
import logoSvg from '../assets/logo.svg';

// مكون الخلفية المتحركة ثلاثية الأبعاد
const AnimatedBackground = () => {
  return (
    <div className="animated-bg">
      <div className="support-cube" style={{ top: '10%', left: '10%' }}></div>
      <div className="support-sphere" style={{ top: '30%', right: '15%' }}></div>
      <div className="support-ring" style={{ bottom: '20%', left: '20%' }}></div>
      <div className="support-cube" style={{ bottom: '10%', right: '10%', width: '40px', height: '40px' }}></div>
    </div>
  );
};

const Header = () => {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);
  const [settingsInitialized, setSettingsInitialized] = useState(false);
  const location = useLocation();
  // متغيرات تتبع محاولات تحميل الشعار والأيقونة
  const [logoLoadAttempts, setLogoLoadAttempts] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  useEffect(() => {
    fetchSiteSettings();
    
    // إعادة محاولة الجلب كل دقيقة للتأكد من تحديث البيانات
    const intervalId = setInterval(() => {
      const now = Date.now();
      // تحقق من مرور وقت كافي منذ آخر عملية جلب (30 ثانية)
      if (now - lastFetchTime > 30000) {
        console.log("Auto-refreshing site settings data");
        fetchSiteSettings();
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [lastFetchTime]);

  const fetchSiteSettings = async () => {
    try {
      setLoading(true);
      console.log("Header - Fetching site settings...");
      
      // استخدام استعلام يجلب أحدث الصفوف مع تعطيل التخزين المؤقت
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching site settings:', error);
        setSettingsInitialized(true);
        setLoading(false);
        return;
      }

      // التحقق من وجود بيانات
      if (data) {
        // استخدم النوع المطلوب
        const settingsData = data as unknown as SiteSettings;
        console.log("Header - Fetched settings:", settingsData);
        
        // التحقق من وجود رابط الشعار
        if (settingsData.logo_url) {
          console.log("Header - Logo URL found:", settingsData.logo_url.substring(0, 50) + "...");
          console.log("Logo URL length:", settingsData.logo_url.length);
        } else {
          console.log("Header - No logo URL found");
        }
        
        // التحقق من وجود رابط الأيقونة
        if (settingsData.favicon_url) {
          console.log("Header - Favicon URL found:", settingsData.favicon_url.substring(0, 50) + "...");
          console.log("Favicon URL length:", settingsData.favicon_url.length);
          updateFavicon(settingsData.favicon_url);
        } else {
          console.log("Header - No favicon URL found");
        }
        
        setSettings(settingsData);

        // تعيين عنوان الصفحة إذا كان متاحًا
        if (settingsData.page_title) {
          document.title = settingsData.page_title;
        }
      } else {
        console.log("Header - No settings data returned from database");
      }
      
      setSettingsInitialized(true);
      setLastFetchTime(Date.now());
    } catch (error) {
      console.error('Error:', error);
      setSettingsInitialized(true);
    } finally {
      setLoading(false);
    }
  };

  // محاولة تحميل الشعار مرة أخرى كل 3 ثوانٍ إذا فشلت المحاولة الأولى (حتى 5 محاولات)
  useEffect(() => {
    if (logoError && logoLoadAttempts < 5 && settings.logo_url) {
      const timer = setTimeout(() => {
        console.log(`Retry loading logo attempt ${logoLoadAttempts + 1}`);
        setLogoError(false);
        setLogoLoadAttempts(prev => prev + 1);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [logoError, logoLoadAttempts, settings.logo_url]);

  const updateFavicon = (faviconUrl: string) => {
    if (!faviconUrl) return;
    
    try {
      console.log("Updating favicon to:", faviconUrl.substring(0, 50) + "...");
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

  // استخدام الشعار الافتراضي إذا فشل تحميل الشعار المخصص
  const handleLogoError = () => {
    console.log('Logo failed to load, using default logo');
    setLogoError(true);
  };

  // التحقق مما إذا كان الشعار عبارة عن سلسلة base64 واستخدامها مباشرة
  const isBase64Image = (str: string) => {
    return str && str.startsWith('data:image');
  };
  
  // تحسين استخراج الشعار لضمان عدم فقدان البيانات
  const logoUrl = logoError 
    ? logoSvg 
    : (settings.logo_url && settings.logo_url.length > 0)
      ? isBase64Image(settings.logo_url) 
        ? settings.logo_url 
        : settings.logo_url
      : logoSvg;
  
  const isTicketStatusActive = location.pathname.startsWith('/ticket-status');
  const isHomeActive = location.pathname === '/';

  if (!settingsInitialized) {
    return null;
  }

  return (
    <header className="w-full relative">
      <AnimatedBackground />
      
      {/* Header العلوي مع الشعار - تم تغيير اللون إلى أزرق متدرج */}
      <div 
        className="py-12 shadow-xl relative overflow-hidden bg-gradient-modern"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        
        <Container>
          <div className="flex flex-col items-center justify-center text-center relative z-10">
            {/* الشعار - مركزة وأكبر مع هالة بيضاء محسنة */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {/* مؤشر أيقونة الدعم الفني */}
                <div className="absolute -top-2 -left-2 bg-support text-white p-2 rounded-full z-10 animate-bounce-gentle shadow-lg">
                  <Headphones size={20} />
                </div>
                
                {/* حاوية الشعار مع تأثير نبض الدعم المحسن وهالة بيضاء */}
                <div className="relative w-36 h-36 md:w-44 md:h-44 overflow-hidden rounded-full shadow-xl bg-white p-3 border-4 border-white/80 logo-pulse-enhanced">
                  {/* إضافة هالة بيضاء أكثر وضوحًا وحركة */}
                  <div className="absolute -inset-1 bg-white animate-glowing rounded-full opacity-80"></div>
                  <AspectRatio ratio={1 / 1} className="overflow-hidden relative z-10">
                    <img 
                      key={`logo-${logoLoadAttempts}-${settings.logo_url?.substring(0, 10) || 'default'}`}
                      src={logoUrl} 
                      alt="شعار نظام الدعم" 
                      className="object-contain h-full w-full transform hover:scale-110 transition-transform duration-500" 
                      onError={handleLogoError} 
                    />
                  </AspectRatio>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <h1 className="text-white text-3xl md:text-4xl font-bold shadow-text animate-fade-in">
                  {settings.site_name || 'نظام الدعم الفني'}
                </h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-white/80 bg-white/10 px-3 py-1 rounded-full text-sm backdrop-blur-sm border border-white/20">
                    <CheckCircle size={14} className="text-green-300" />
                    <span>متاح 24/7</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
      
      {/* شريط التنقل */}
      <nav className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-20 backdrop-blur-md bg-white/90">
        <Container>
          <div className="flex justify-center py-3">
            <div className="flex gap-4">
              <Link 
                to="/" 
                className={isHomeActive ? "nav-link-active" : "nav-link-primary"}
              >
                <Home size={18} />
                <span>الرئيسية</span>
              </Link>
              
              <Link 
                to="/ticket-status" 
                className={isTicketStatusActive ? "nav-link-active" : "nav-link-secondary"}
              >
                <Search size={18} />
                <span>متابعة التذاكر</span>
              </Link>
            </div>
          </div>
        </Container>
      </nav>
      
      {/* معلومات التذييل - مرئية فقط على الشاشات الكبيرة */}
      <div className="fixed bottom-0 left-0 right-0 py-2 px-4 bg-white/90 backdrop-blur-md text-gray-700 text-xs text-center z-10 border-t shadow-md">
        <Container className="flex justify-center items-center gap-2">
          <PanelRight size={14} className="text-support" />
          <span>{settings.footer_text || 'نظام الدعم الفني المتكامل'}</span>
        </Container>
      </div>
    </header>
  );
};

export default Header;
