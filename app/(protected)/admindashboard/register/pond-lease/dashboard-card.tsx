import { Card, CardContent } from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
}

export function DashboardCard({
  title,
  value,
  icon,
  footer,
}: DashboardCardProps) {
  return (
    <Card className="border bg-gray-50 shadow-none">
      <CardContent className="p-4">

        <div className="flex items-center justify-between">

          <div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">
              {title}
            </div>

            <div className="text-2xl font-semibold text-orange-700 mt-1">
              {value}
            </div>
          </div>

          {icon && (
            <div className="text-gray-500">{icon}</div>
          )}

        </div>

        {footer && (
          <div className="text-xs text-gray-500 mt-3 border-t pt-2">
            {footer}
          </div>
        )}

      </CardContent>
    </Card>
  );
}
