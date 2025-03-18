
import { useEffect, useState } from 'react';

const DateTimeDisplay = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Format date to Arabic locale
  const formattedDate = currentDateTime.toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format time
  const formattedTime = currentDateTime.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <div className="text-company-dark text-sm md:text-base flex flex-col md:flex-row items-end gap-2 md:gap-4 bg-accent-silver/30 p-2 rounded-lg animate-fade-in">
      <div className="flex items-center gap-1">
        <span className="font-medium bg-white px-2 py-1 rounded shadow-sm">{formattedTime}</span>
        <span className="text-company">الوقت:</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="font-medium bg-white px-2 py-1 rounded shadow-sm">{formattedDate}</span>
        <span className="text-company">التاريخ:</span>
      </div>
    </div>
  );
};

export default DateTimeDisplay;
