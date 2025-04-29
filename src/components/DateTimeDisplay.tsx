
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
    <div className="flex items-center justify-center gap-8 flex-wrap">
      {/* Clock Section */}
      <div className="flex items-center bg-white/80 backdrop-blur-sm shadow-md rounded-lg px-4 py-3 border border-gray-100">
        <div className="rounded-full bg-blue-50 p-2 mr-3">
          <Clock size={22} className="text-company" />
        </div>
        <div className="text-gray-700">
          <span className="font-bold">{formattedTime}</span>
        </div>
      </div>

      {/* Date Section */}
      <div className="flex items-center bg-white/80 backdrop-blur-sm shadow-md rounded-lg px-4 py-3 border border-gray-100">
        <div className="rounded-full bg-blue-50 p-2 mr-3">
          <Calendar size={22} className="text-company" />
        </div>
        <div className="text-gray-700">
          <span className="font-bold">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default DateTimeDisplay;
