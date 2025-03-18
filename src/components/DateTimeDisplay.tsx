
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
    <div className="text-muted-foreground text-sm md:text-base flex flex-col md:flex-row items-end gap-1 md:gap-3 animate-fade-in">
      <div className="flex items-center gap-1">
        <span className="font-medium">{formattedTime}</span>
        <span>الوقت:</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="font-medium">{formattedDate}</span>
        <span>التاريخ:</span>
      </div>
    </div>
  );
};

export default DateTimeDisplay;
