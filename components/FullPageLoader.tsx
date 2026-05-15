"use client";

import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface FullPageLoaderProps {
  isLoading: boolean;
  progress: number;
  title: string;
  description: string;
}

export default function FullPageLoader({
  isLoading,
  progress,
  title,
  description,
}: FullPageLoaderProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6 border border-slate-100">
        <div className="flex justify-center">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-orange-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-orange-600">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            {description}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Processing</span>
            <span className="text-orange-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 w-full bg-slate-100" />
        </div>

        <div className="pt-2">
          <p className="text-[10px] text-center text-slate-400 font-medium">
            Please do not close this window or refresh the page
          </p>
        </div>
      </div>
    </div>
  );
}
