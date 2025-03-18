
import { Link } from 'react-router-dom';
import logoSvg from '../assets/logo.svg';

const Header = () => {
  return (
    <div className="flex flex-col w-full">
      {/* Top header with logo and company name */}
      <div className="w-full bg-company py-4 px-6">
        <div className="container mx-auto flex flex-col items-end space-y-3">
          <div className="bg-white rounded-lg p-3 shadow-md w-48">
            <img 
              src={logoSvg} 
              alt="شركة الوصل الوطنية" 
              className="h-10 w-auto" 
            />
          </div>
          <div className="flex flex-col items-end">
            <h1 className="text-xl md:text-2xl font-bold text-white">شركة الوصل الوطنية لتحصيل ديون جهات التمويل</h1>
            <div className="h-0.5 w-full bg-accent-gold mt-1"></div>
          </div>
        </div>
      </div>
      
      {/* Navigation bar */}
      <nav className="w-full bg-company-dark py-3 px-6 shadow-md mb-6">
        <div className="container mx-auto flex justify-center md:justify-end space-x-8">
          <Link 
            to="/ticket-status" 
            className="text-white hover:text-accent-gold transition-colors duration-200 mx-4 font-medium text-lg flex items-center"
          >
            <span>متابعة طلب الدعم</span>
            <div className="h-5 w-5 rounded-full bg-white mr-2 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-company" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
          </Link>
          <Link 
            to="/" 
            className="text-white hover:text-accent-gold transition-colors duration-200 mx-4 font-medium text-lg flex items-center"
          >
            <span>طلب دعم فني</span>
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
