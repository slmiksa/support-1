
import { Link } from 'react-router-dom';
import logoSvg from '../assets/logo.svg';

const Header = () => {
  return (
    <header className="w-full py-6 md:py-8 px-6 md:px-10 mb-6 bg-gradient-primary text-white shadow-md">
      <div className="container mx-auto">
        <div className="flex flex-col items-end justify-between">
          <div className="flex flex-col items-end mb-4">
            <div className="bg-white p-3 rounded-lg shadow-md w-56 mb-3">
              <img 
                src={logoSvg} 
                alt="شركة الوصل الوطنية" 
                className="h-10 w-auto" 
              />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white">شركة الوصل الوطنية لتحصيل ديون جهات التمويل</h1>
            <div className="h-0.5 w-3/4 bg-accent-gold mt-2"></div>
          </div>
          <nav className="flex space-x-6 text-right">
            <Link 
              to="/ticket-status" 
              className="text-white hover:text-accent-gold transition-colors duration-200 mr-6 font-medium text-lg flex items-center"
            >
              <span>متابعة طلب الدعم</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link 
              to="/" 
              className="text-white hover:text-accent-gold transition-colors duration-200 font-medium text-lg flex items-center"
            >
              <span>طلب دعم فني</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
