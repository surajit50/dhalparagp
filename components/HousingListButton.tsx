"use client";
import React, { useState, useEffect } from "react";
import { Home, ExternalLink, ArrowRight } from "lucide-react";

const HousingListButton = () => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating((prev) => !prev);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const openHousingList = () => {
    window.open(
      "https://www.dakshindinajpurzp.org/ddzp_panel/site/index.php?route=common/pmay",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-sm mx-auto">
      <div
        className={`
        relative overflow-hidden rounded-lg border border-blue-200/50
        bg-gradient-to-r from-blue-50/80 to-blue-100/80
        p-0.5 shadow-md transition-all duration-300
        ${isAnimating ? "shadow-blue-200/30" : "shadow-blue-300/40"}
      `}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-5"></div>

        <button
          onClick={openHousingList}
          className={`
            relative flex items-center justify-between gap-2
            rounded-md bg-gradient-to-r from-blue-500 to-blue-600
            px-4 py-2.5 text-white shadow-sm
            transition-all duration-300 ease-out
            hover:from-blue-600 hover:to-blue-700
            focus:outline-none focus:ring-1 focus:ring-blue-400 focus:ring-offset-1
            active:scale-[0.98]
          `}
          aria-label="View housing list"
        >
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span className="text-sm font-medium">Housing List</span>
          </div>

          <div
            className={`
            flex items-center transition-transform duration-300
            ${isAnimating ? "translate-x-0.5" : "-translate-x-0"}
          `}
          >
            <ExternalLink className="h-4 w-4 mr-0.5" />
            <ArrowRight
              className={`
              h-4 w-4 transition-transform duration-300
              ${isAnimating ? "translate-x-0.5" : "-translate-x-0"}
            `}
            />
          </div>
        </button>
      </div>

      <div className="mt-3 text-center">
        <p className="text-sm text-gray-600 font-medium">
          Check your housing list status
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Official PMAY Housing List Portal
        </p>
      </div>
    </div>
  );
};

export default HousingListButton;
