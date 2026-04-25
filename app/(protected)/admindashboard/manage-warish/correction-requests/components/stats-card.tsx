import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
  iconBgClass?: string;
  valueColorClass?: string;
  borderColorClass?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  iconBgClass = "bg-primary/10",
  valueColorClass = "text-foreground",
  borderColorClass = "border-l-4 border-primary",
}: StatsCardProps) {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg border",
        borderColorClass
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className={cn("text-3xl font-bold tracking-tight", valueColorClass)}>
                {value.toLocaleString()}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          
          <div className={cn("p-3 rounded-xl shadow-sm", iconBgClass)}>
            <div className="w-5 h-5 text-current opacity-80">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
