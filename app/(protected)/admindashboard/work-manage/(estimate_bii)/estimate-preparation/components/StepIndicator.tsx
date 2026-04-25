import { Check } from "lucide-react";
import { STEPS } from "../constants";

interface StepIndicatorProps {
  currentStep: number;
  completedUpTo: number;
  onStepClick: (step: number) => void;
}

export function StepIndicator({
  currentStep,
  completedUpTo,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="flex items-center min-w-max mx-auto justify-center px-2 py-1">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isDone = completedUpTo >= step.id && !isActive;
          const isClickable = step.id <= completedUpTo + 1;

          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={`flex flex-col items-center gap-1.5 group transition-all duration-200 ${
                  isClickable
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-50"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    isActive
                      ? "border-wb-primary bg-wb-primary text-white shadow-lg shadow-wb-primary/30 scale-110"
                      : isDone
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-300 bg-white text-slate-400 group-hover:border-wb-primary/50"
                  }`}
                >
                  {isDone ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={`text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? "text-wb-primary"
                      : isDone
                        ? "text-emerald-600"
                        : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {/* connector */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-12 md:w-20 mx-1 md:mx-2 rounded-full transition-all duration-500 ${
                    completedUpTo >= step.id ? "bg-emerald-400" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
