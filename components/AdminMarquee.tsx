// components/AdminMarquee.tsx
'use client'; 

import { AlertCircle } from "lucide-react";

interface AdminMarqueeProps {
  message: string;
  bgColor?: string;
  textColor?: string;
  speed?: number;
  icon?: React.ReactNode;
}

const AdminMarquee = ({
  message,
  bgColor = '#ef4444', // Default red hex code
  textColor = '#ffffff', // Default white hex code
  speed = 20,
  icon = <AlertCircle className="w-4 h-4" /> // Upgraded default icon
}: AdminMarqueeProps) => {
  return (
    <div 
      className="relative flex overflow-x-hidden group py-2.5 shadow-sm z-50 border-b border-black/10"
      style={{ backgroundColor: bgColor, color: textColor }}
      role="alert"
    >
      <div 
        className="whitespace-nowrap animate-marquee flex items-center group-hover:[animation-play-state:paused] will-change-transform"
        style={{ animationDuration: `${speed}s` }}
      >
        {/* We repeat the message 3 times to create a seamless infinite scroll effect without huge blank gaps */}
        {[1, 2, 3].map((key) => (
          <span 
            key={key} 
            className="flex items-center gap-2.5 mx-8 text-sm font-medium tracking-wide"
            aria-hidden={key !== 1} // Only the first one is read by screen readers
          >
            {icon}
            {message}
            
            {/* A small dot to separate repeating messages if they run into each other */}
            <span className="w-1 h-1 rounded-full bg-current opacity-30 ml-8" />
          </span>
        ))}
      </div>
    </div>
  );
};

export default AdminMarquee;
