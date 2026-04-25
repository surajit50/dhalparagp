
import { STEPS } from "../constants";

export function StepHeader({
  step,
  icon,
  title,
  description,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200">
        {icon}
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
          Step {step} of {STEPS.length}
        </div>
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}
