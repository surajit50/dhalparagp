
import { useState } from "react";

export function useEstimateWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedUpTo, setCompletedUpTo] = useState(0);

  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goNext = () => {
    const next = currentStep + 1;
    if (next > completedUpTo + 1) setCompletedUpTo(currentStep);
    else if (currentStep > completedUpTo) setCompletedUpTo(currentStep);
    goToStep(next);
  };

  const goPrev = () => goToStep(currentStep - 1);

  const advanceToStep = (step: number) => {
    setCompletedUpTo((prev) => Math.max(prev, step - 1));
    goToStep(step);
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setCompletedUpTo(0);
  };

  return {
    currentStep,
    completedUpTo,
    setCompletedUpTo,
    goToStep,
    goNext,
    goPrev,
    advanceToStep,
    resetWizard,
  };
}
