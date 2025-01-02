"use client";

import { useEffect, useState } from "react";

interface CountdownTimerClientProps {
  initialTimeLeft: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  targetDate: string;
}

export default function CountdownTimerClient({
  initialTimeLeft,
  targetDate,
}: CountdownTimerClientProps) {
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);

  useEffect(() => {
    const target = new Date(targetDate);

    const intervalId = setInterval(() => {
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        clearInterval(intervalId);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [targetDate]);

  return (
    <div className="flex justify-center space-x-1 md:space-x-6">
      {Object.entries(timeLeft).map(([key, value]) => (
        <div key={key} className="text-center">
          <div className="text-5xl font-bold text-yellow-400 bg-black bg-opacity-50 rounded-lg p-4 w-20 md:w-24">
            {value.toString().padStart(2, "0")}
          </div>
          <div className="text-sm uppercase text-yellow-200 mt-2">{key}</div>
        </div>
      ))}
    </div>
  );
}
