/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

export default function IndianClock() {
  const [time, setTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isAm: true,
  });

  const [volumeOn, setVolumeOn] = useState(true);
  const [lastAnnouncedHour, setLastAnnouncedHour] = useState(-1);
  const [showTooltip, setShowTooltip] = useState(false);
  const announcementRef = useRef<HTMLDivElement>(null);

  // Calculate rotations for clock hands
  const secondRotation = (time.seconds / 60) * 360;
  const minuteRotation = ((time.minutes + time.seconds / 60) / 60) * 360;
  const hourRotation = (((time.hours % 12) + time.minutes / 60) / 12) * 360;

  // Format time for display
  const formattedHours = time.hours % 12 || 12;
  const formattedMinutes = time.minutes.toString().padStart(2, "0");
  const period = time.hours >= 12 ? "PM" : "AM";

  // Announce time at the start of each hour
  const announceTime = () => {
    if (!volumeOn || lastAnnouncedHour === time.hours) return;

    const hourToAnnounce = formattedHours === 12 ? 12 : formattedHours;
    const announcement = `The time is ${hourToAnnounce} o'clock IST`;

    if (announcementRef.current) {
      announcementRef.current.textContent = announcement;
      announcementRef.current.classList.remove("opacity-0");
      announcementRef.current.classList.add("opacity-100");

      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.classList.remove("opacity-100");
          announcementRef.current.classList.add("opacity-0");
        }
      }, 5000);
    }

    // Use Web Speech API to announce time
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(announcement);
      utterance.lang = "en-IN";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }

    setLastAnnouncedHour(time.hours);
  };

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      const now = new Date();

      // Correct way to get IST time
      // Method 1: Using toLocaleString with Asia/Kolkata timezone
      const istTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      );

      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();
      const seconds = istTime.getSeconds();

      setTime({
        hours,
        minutes,
        seconds,
        isAm: hours < 12,
      });

      // Check if it's the start of a new hour
      if (minutes === 0 && seconds === 0) {
        announceTime();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [volumeOn, lastAnnouncedHour, time.hours, formattedHours, announceTime]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Announcement Bar (hidden, for accessibility) */}
      <div
        ref={announcementRef}
        className="absolute bottom-full right-0 mb-3 bg-white/90 text-purple-800 rounded-full py-2 px-4 shadow-lg transition-opacity duration-500 opacity-0 text-xs font-medium pointer-events-none"
        style={{ zIndex: 100 }}
      >
        Announcing the time (IST)...
      </div>
      {/* Floating Bell Icon */}
      {showTooltip && (
        <div className="bg-white text-purple-800 px-3 py-1 rounded-full mb-2 text-xs font-medium shadow-lg">
          {volumeOn ? "Announcements ON" : "Announcements OFF"}
        </div>
      )}
      <button
        onClick={() => setVolumeOn(!volumeOn)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`mb-2 p-2 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg border border-purple-300 bg-white/90 ${
          volumeOn ? "text-yellow-500" : "text-gray-400"
        }`}
        aria-label={volumeOn ? "Mute announcements" : "Unmute announcements"}
      >
        <Bell className="h-6 w-6" fill={volumeOn ? "#facc15" : "none"} />
      </button>
      {/* Small Analog Clock */}
      <div className="relative w-24 h-24 bg-gradient-to-br from-gray-900 to-black border-4 border-purple-700/30 rounded-full shadow-lg flex items-center justify-center">
        {/* Hour markers */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`absolute top-0 left-1/2 w-0.5 h-3 ${
              i % 3 === 0 ? "bg-purple-500 h-4" : "bg-purple-400"
            } origin-bottom`}
            style={{
              transform: `translateX(-50%) rotate(${
                i * 30
              }deg) translateY(0.5rem)`,
            }}
          ></div>
        ))}
        {/* Hour hand */}
        <div
          className="absolute top-1/2 left-1/2 w-1 bg-white rounded-lg origin-bottom"
          style={{
            height: "28px",
            transform: `translate(-50%, -100%) rotate(${hourRotation}deg)`,
            transformOrigin: "center bottom",
          }}
        ></div>

        {/* Minute hand */}
        <div
          className="absolute top-1/2 left-1/2 w-0.5 bg-purple-300 rounded-lg origin-bottom"
          style={{
            height: "40px",
            transform: `translate(-50%, -100%) rotate(${minuteRotation}deg)`,
            transformOrigin: "center bottom",
          }}
        ></div>

        {/* Second hand */}
        <div
          className="absolute top-1/2 left-1/2 w-0.5 bg-red-500 origin-bottom"
          style={{
            height: "44px",
            transform: `translate(-50%, -100%) rotate(${secondRotation}deg)`,
            transformOrigin: "center bottom",
          }}
        ></div>
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-purple-500 rounded-full -translate-x-1/2 -translate-y-1/2 z-20"></div>
      </div>
      {/* Digital IST time below clock */}
      <div className="mt-1 flex flex-col items-center">
        <span className="font-mono text-base text-purple-900 bg-white/80 rounded px-2 py-0.5 shadow-sm">
          {formattedHours}:{formattedMinutes} {period}
        </span>
        <span className="text-xs text-purple-700 font-semibold mt-0.5">
          IST
        </span>
      </div>
    </div>
  );
}
