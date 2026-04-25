"use client";

import React, { useState, useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { AlertDescription } from "@/components/ui/alert";

interface ImportantMessageProps {
  message: string;
  speed?: number; // pixels per second
  pauseOnHover?: boolean;
  icon?: React.ReactNode;
}

export default function ImportantMessage({
  message,
  speed = 50,
  pauseOnHover = true,
  icon = <AlertCircle className="h-4 w-4" />,
}: ImportantMessageProps) {
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const messageElement = messageRef.current;
    if (!container || !messageElement) return;

    const messageWidth = messageElement.scrollWidth;
    const containerWidth = container.clientWidth;
    const animationDuration = messageWidth / speed;

    container.style.setProperty("--scroll-duration", `${animationDuration}s`);

    const resetAnimation = () => {
      container.style.animation = "none";
      void container.offsetWidth; // Trigger reflow
      container.style.animation = "";
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          resetAnimation();
        }
      },
      { threshold: 0 }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [message, speed]);

  const handleMouseEnter = () => pauseOnHover && setIsPaused(true);
  const handleMouseLeave = () => pauseOnHover && setIsPaused(false);

  return (
    <div
      ref={containerRef}
      className={`flex whitespace-nowrap overflow-hidden ${
        isPaused ? "pause-animation" : "animate-scroll"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-live="polite"
      aria-atomic="true"
    >
      <div ref={messageRef} className="flex items-center mr-8">
        {icon && <span className="mr-2">{icon}</span>}
        <AlertDescription>{message}</AlertDescription>
      </div>
    </div>
  );
}
