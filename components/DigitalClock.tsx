"use client";

import { useState, useEffect } from "react";

export default function TinyDigitalClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Initialize time only on client side
    setTime(new Date());

    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 100); // Update every 100ms instead of 1ms for better performance

    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const milliseconds = date.getMilliseconds().toString().padStart(3, "0");
    return { hours, minutes, seconds, milliseconds };
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Don't render anything until the component is mounted on the client
  if (!time) {
    return (
      <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm">
        <div className="text-lg font-bold text-gray-800 mb-2">Loading...</div>
        <div className="inline-flex items-baseline justify-center h-8 text-lg font-mono font-medium bg-white p-2 rounded-md shadow-inner">
          <span className="text-gray-500">--:--:--.---</span>
        </div>
      </div>
    );
  }

  const { hours, minutes, seconds, milliseconds } = formatTime(time);
  const fullTime = `${hours}:${minutes}:${seconds}.${milliseconds}`;
  const currentDate = formatDate(time);

  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm">
      <div
        className="inline-flex items-center justify-center h-2 text-lg font-mono font-medium bg-white p-2 rounded-md shadow-inner gap-4"
        aria-label={`Current date and time: ${currentDate} ${fullTime}`}
      >
        <div className="flex items-center text-xl">
          <span className="text-gray-600 tabular-nums">{currentDate}</span>
          <span className="text-gray-500 mx-2">|</span>
          <span className="text-blue-600 tabular-nums w-8 text-center">
            {hours}
          </span>
          <span className="text-gray-500 mx-1">:</span>
          <span className="text-green-600 tabular-nums w-8 text-center">
            {minutes}
          </span>
          <span className="text-gray-500 mx-1">:</span>
          <span className="text-yellow-600 tabular-nums w-8 text-center">
            {seconds}
          </span>
          <span className="text-gray-500">.</span>
          <span className="text-red-500 tabular-nums w-12 text-center">
            {milliseconds}
          </span>
        </div>
      </div>
    </div>
  );
}
