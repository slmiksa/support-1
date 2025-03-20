
import { useEffect, useState } from 'react';

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

  // Format date to English locale
  const formattedDate = currentDateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="text-[#222222] text-center">
      <span className="ml-2 font-medium">Time:</span>
      <span className="font-medium">{formattedTime}</span>
      <span className="mx-4 font-medium">Date:</span>
      <span className="font-medium">{formattedDate}</span>
    </div>
  );
};

export default DateTimeDisplay;
