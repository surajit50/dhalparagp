"use client";

import {
  LucideIcon,
  Wrench,
  Settings2,
  PackageSearch,
  Users,
  Receipt,
  Coins,
  Plus,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  UserCheck,
  Layers,
  Banknote,
  History,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const iconMap: Record<string, LucideIcon> = {
  Wrench,
  Settings2,
  PackageSearch,
  Users,
  Receipt,
  Coins,
  Plus,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  UserCheck,
  Layers,
  Banknote,
  History,
  Ban,
};

interface PageHeaderProps {
  title: string;
  description?: string;
  icon: keyof typeof iconMap;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon,
  children,
  className,
}: PageHeaderProps) {
  const Icon = iconMap[icon] || Wrench;

  return (
    <div
      className={cn(
        "relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-3xl border shadow-sm overflow-hidden",
        className,
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />

      <div className="relative flex gap-5 items-start z-10">
        <div className="p-4 bg-primary/10 rounded-2xl shrink-0 shadow-inner">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="text-slate-500 mt-2 text-lg max-w-2xl font-medium leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {children && (
        <div className="relative flex items-center gap-3 shrink-0 z-10">
          {children}
        </div>
      )}
    </div>
  );
}
