
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logoSvg from '../assets/logo.svg';

const Header = () => {
  return (
    <header className="w-full py-4 px-6 md:px-10 mb-6 bg-white shadow-sm animate-fade-in">
      <div className="container mx-auto">
        <div className="flex flex-col items-end justify-between">
          <div className="flex items-center gap-4 mb-2">
            <div className="text-right">
              <h1 className="text-xl font-bold text-company">شركة الوصل الوطنية لتحصيل ديون جهات التمويل</h1>
            </div>
            <img 
              src={logoSvg} 
              alt="شركة الوصل الوطنية" 
              className="h-12 w-auto" 
            />
          </div>
          <nav className="flex space-x-6 text-right">
            <Link 
              to="/ticket-status" 
              className="text-gray-600 hover:text-company transition-colors duration-200 ml-6"
            >
              متابعة طلب الدعم
            </Link>
            <Link 
              to="/" 
              className="text-gray-600 hover:text-company transition-colors duration-200"
            >
              طلب دعم فني
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
