
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // تحقق من وجود قيمة مخزنة محلياً
    const savedTheme = localStorage.getItem('admin-theme');
    return (savedTheme as Theme) || 'light';
  });

  useEffect(() => {
    // تحديث الكلاس في عنصر html عند تغيير الثيم - فقط للصفحات الإدارية
    const adminPaths = ['/admin', '/admin/'];
    const pathname = window.location.pathname;
    const isAdminPage = pathname.startsWith('/admin/') || adminPaths.includes(pathname);
    
    const root = window.document.documentElement;
    
    if (isAdminPage) {
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else {
      // إزالة الوضع المظلم دائمًا من الصفحات غير الإدارية
      root.classList.remove('dark');
    }
    
    // حفظ الخيار في التخزين المحلي
    localStorage.setItem('admin-theme', theme);
  }, [theme]);

  // راقب تغيير المسار لتحديث الثيم
  useEffect(() => {
    const handleRouteChange = () => {
      const adminPaths = ['/admin', '/admin/'];
      const pathname = window.location.pathname;
      const isAdminPage = pathname.startsWith('/admin/') || adminPaths.includes(pathname);
      const root = window.document.documentElement;
      
      if (isAdminPage) {
        if (theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      } else {
        // إزالة الوضع المظلم دائمًا من الصفحات غير الإدارية
        root.classList.remove('dark');
      }
    };

    // استمع لتغييرات المسار
    window.addEventListener('popstate', handleRouteChange);
    
    // تنظيف عند إلغاء التحميل
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
