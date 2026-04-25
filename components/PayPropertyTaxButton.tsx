"use client";

import { useState, useEffect } from "react";
import { ExternalLink, ArrowRight, Building } from "lucide-react";

const PayPropertyTaxButton = () => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating((prev) => !prev);
    }, 1500); // Slower interval for more subtle effect

    return () => clearInterval(interval);
  }, []);

  const openTaxPortal = () => {
    window.open("https://prdtax.wb.gov.in/", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-sm mx-auto">
      <div
        className={`
        relative overflow-hidden rounded-lg border border-orange-200/50
        bg-gradient-to-r from-orange-50/80 to-orange-100/80
        p-0.5 shadow-md transition-all duration-300
        ${isAnimating ? "shadow-orange-200/30" : "shadow-orange-300/40"}
      `}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-5"></div>

        <button
          onClick={openTaxPortal}
          className={`
            relative flex items-center justify-between gap-2
            rounded-md bg-gradient-to-r from-orange-500 to-orange-600
            px-4 py-2.5 text-white shadow-sm
            transition-all duration-300 ease-out
            hover:from-orange-600 hover:to-orange-700
            focus:outline-none focus:ring-1 focus:ring-orange-400 focus:ring-offset-1
            active:scale-[0.98]
          `}
          aria-label="Pay property tax online"
        >
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="text-sm font-medium">Pay Property Tax</span>
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
          Pay your property tax online securely
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Official West Bengal Property Tax Portal
        </p>
      </div>
    </div>
  );
};

export default PayPropertyTaxButton;
