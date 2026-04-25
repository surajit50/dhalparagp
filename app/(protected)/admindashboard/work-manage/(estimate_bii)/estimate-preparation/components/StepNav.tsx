
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function StepNav({
  step,
  totalSteps,
  canNext,
  onPrev,
  onNext,
  nextLabel,
  nextDisabledHint,
}: {
  step: number;
  totalSteps: number;
  canNext: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabledHint?: string;
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      <div>
        {step > 1 && onPrev && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
            className="gap-2 border-slate-300 hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        )}
      </div>
      <div className="flex items-center gap-3">
        {!canNext && nextDisabledHint && (
          <span className="text-xs text-slate-400 hidden sm:inline">{nextDisabledHint}</span>
        )}
        {step < totalSteps && onNext && (
          <Button
            type="button"
            onClick={canNext ? onNext : undefined}
            disabled={!canNext}
            className="gap-2 bg-wb-primary hover:bg-wb-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {nextLabel || "Next"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
