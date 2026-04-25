
import { Building, FileText, Ruler, ListChecks, Calculator } from "lucide-react";

export const STEPS = [
  { id: 1, label: "Select Work", icon: Building },
  { id: 2, label: "Project Details", icon: FileText },
  { id: 3, label: "Dimensions", icon: Ruler },
  { id: 4, label: "Add Items", icon: ListChecks },
  { id: 5, label: "Summary & Save", icon: Calculator },
] as const;
