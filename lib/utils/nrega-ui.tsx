/**
 * nrega-ui.tsx
 * React-dependent UI config for the NREGA module.
 * Kept separate from nrega.ts so that pure server components
 * can import from nrega.ts without pulling in React.
 */
import { CheckCircle2, Clock, Ban, Printer } from "lucide-react";

export const CERTIFICATE_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  DRAFT: {
    label: "Pending",
    color: "text-amber-600 border-amber-200 bg-amber-50",
    icon: <Clock className="h-3 w-3" />,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-green-700 border-green-200 bg-green-50",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  PRINTED: {
    label: "Printed",
    color: "text-blue-700 border-blue-200 bg-blue-50",
    icon: <Printer className="h-3 w-3" />,
  },
  NOT_APPLICABLE: {
    label: "N/A",
    color: "text-orange-600 border-orange-200 bg-orange-50",
    icon: <Ban className="h-3 w-3" />,
  },
};
