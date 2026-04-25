
export function InfoField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
        {icon}
        {label}
      </label>
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 text-sm">
        {value}
      </div>
    </div>
  );
}
