import { CheckCircle, XCircle } from "lucide-react";

interface StatusAlertProps {
  type: "success" | "error";
  message: string;
}

export function StatusAlert({ type, message }: StatusAlertProps) {
  const Icon = type === "success" ? CheckCircle : XCircle;
  const bgColor = type === "success" ? "bg-emerald-50" : "bg-red-50";
  const borderColor =
    type === "success" ? "border-emerald-200" : "border-red-200";
  const textColor = type === "success" ? "text-emerald-700" : "text-red-700";
  const iconColor = type === "success" ? "text-emerald-600" : "text-red-600";

  return (
    <div
      className={`p-4 border rounded-lg flex items-center gap-3 ${bgColor} ${borderColor}`}
    >
      <Icon className={`h-5 w-5 ${iconColor}`} />
      <span className={textColor}>{message}</span>
    </div>
  );
}
