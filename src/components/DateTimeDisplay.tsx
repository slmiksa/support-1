
import { useEffect, useState } from 'react';
import { Clock, Calendar } from 'lucide-react';

const DateTimeDisplay = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Format time in English (en-US)
  const formattedTime = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Format date to English locale (Gregorian calendar)
  const formattedDate = currentDateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="flex items-center justify-center gap-4 flex-row">
      {/* Date Section */}
      <div className="flex items-center bg-white shadow-sm rounded-lg px-3 py-2 border border-gray-100">
        <div className="rounded-full bg-blue-50 p-1.5 mr-2">
          <Calendar size={18} className="text-company" />
        </div>
        <div className="text-gray-700">
          <span className="font-medium text-sm">{formattedDate}</span>
        </div>
      </div>

      {/* Clock Section */}
      <div className="flex items-center bg-white shadow-sm rounded-lg px-3 py-2 border border-gray-100">
        <div className="rounded-full bg-blue-50 p-1.5 mr-2">
          <Clock size={18} className="text-company" />
        </div>
        <div className="text-gray-700">
          <span className="font-medium text-sm">{formattedTime}</span>
        </div>
      </div>
    </div>
  );
};

export default DateTimeDisplay;
