
import { useEffect, useState } from 'react';

const DateTimeDisplay = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Format time
  const formattedTime = currentDateTime.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Format date to Arabic locale
  const formattedDate = currentDateTime.toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="text-company-dark text-right">
      <span className="ml-2 font-medium">الوقت:</span>
      <span className="font-medium">{formattedTime}</span>
      <span className="mr-8 ml-2 font-medium">التاريخ:</span>
      <span className="font-medium">{formattedDate}</span>
    </div>
  );
};

export default DateTimeDisplay;
